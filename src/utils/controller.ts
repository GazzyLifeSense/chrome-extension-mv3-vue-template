
/*
======并发控制器======
    q: 请求队列
    max: 任务最大并发数
    cb: 队列完成回调
*/
export async function limitRequest(
  q: any[],
  max: number,
  handler: Function,
  {
    onStart,
    onFinish,
    signal,
    delay,
  }: { onStart: Function; onFinish: Function; signal?: AbortSignal; delay?: number }
) {
  onStart && onStart();
  const request = generatorRequest(q, handler);
  let sent = 0;
  let received = 0;
  const size = Math.min(q.length, max);
  function runIt() {
    request
      .next()
      .value.then(async (_: any) => {
        received++;
        if (sent < q.length) {
          await counter();
        } else if (received == q.length) {
          request.return();
          onFinish && onFinish();
        }
      })
      .catch(async (err: any) => {
        err && console.log(err);
        received++;
        if (sent < q.length) {
          await counter();
        } else if (received == q.length) {
          request.return();
          onFinish && onFinish();
        }
      });
  }
  while (sent < size) {
    await counter();
  }
  async function counter() {
    if (signal?.aborted) {
      onFinish && onFinish();
      return;
    }
    sent++;
    runIt();
    delay && (await new Promise(resolve => setTimeout(resolve, Math.random() * delay)));
  }
}

// 请求生成器
function* generatorRequest(q: any[], handler: Function) {
  let t = 0;
  while (true) {
    yield handler(q[t++]) as any;
  }
}

/*
  插入数据
  params: data - 数据源
          value - 数据
          key - 对比键
          action - 插入行为
*/
export function insertData(
  data: Array<any>,
  value: any,
  { key = 'id', action = 'push', cb = () => {} } = {}
) {
  if (!Array.isArray(data) || !value || typeof value != 'object' || !value[key]) return;

  // 插入行为
  const insertAction =
    action == 'push'
      ? () => data.push(value)
      : action == 'unshift'
      ? () => data.unshift(value)
      : () => {};

  // 匹配已存在数据，并更新
  if (data.length) {
    let flag = 0;
    for (let i = 0; i <= data.length; i++) {
      const item = data[i];
      if (item?.[key] == value?.[key]) {
        // 主键相同, 合并非空属性
        for (const prop in value) {
          if (value?.hasOwnProperty?.(prop) && value[prop] !== undefined && value[prop] !== null) {
            item[prop] = value[prop];
          }
        }
        cb && cb();
        flag = 1;
        break;
      }
    }
    // 无匹配时直接插入
    if (!flag) insertAction();
  } else {
    insertAction();
  }
}
