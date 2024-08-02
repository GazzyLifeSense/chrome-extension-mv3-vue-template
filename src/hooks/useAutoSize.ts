
import { ref, reactive, watch } from 'vue';
import { throttle } from '@/utils/public.ts';

function useAutoSize({
  // 初始宽高
  initialWidth = 1600,
  initialHeight = 600,
  // 占屏百分比
  xPercent = 0.95,
  yPercent = 0.8,
  // 偏移量
  xOffset = 0,
  yOffset = 0,
}) {
  const fitWidth = ref(initialWidth);
  const fitHeight = ref(initialHeight);

  new ResizeObserver(() => {
    fitWidth.value = document.documentElement.clientWidth * xPercent - xOffset;
    fitHeight.value = document.documentElement.clientHeight * yPercent - yOffset;
  }).observe(document.documentElement);

  return { fitWidth, fitHeight };
}

function usePanelSize({
  initialHeight = 450,
  minHeight,
  endHeight,
  endCb,
}: {
  initialHeight?: number;
  minHeight?: number;
  endHeight?: number;
  endCb?: Function;
} = {}) {
  const height = ref(initialHeight);
  const dragStatus = ref(0);
  const isFullScreen = ref(false);
  const rootEle = document.documentElement;

  // 开始拖拽
  function startDrag(event: MouseEvent) {
    dragStatus.value = 1;
    const diffY = event.clientY - (rootEle.clientHeight - height.value);

    // 拖拽中
    document.onmousemove = throttle(function (event: MouseEvent) {
      let moveY = event.clientY - diffY;
      if (moveY < 0) {
        moveY = 0;
      } else if (moveY > window.innerHeight) {
        moveY = window.innerHeight;
      }
      let dstHeight = rootEle.clientHeight - moveY;
      // 最小高度
      if (minHeight && dstHeight < minHeight) dstHeight = minHeight;
      height.value = dstHeight;

      // 低于指定高度时触发回调
      if (endHeight && height.value < endHeight) {
        endCb && endCb?.();
      }
    }, 10);

    // 左键松开结束拖拽
    document.onmouseup = endDrag;
  }

  // 结束拖拽
  function endDrag() {
    dragStatus.value = 0;
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // 切换全屏、退出全屏
  async function switchFullScreen() {
    if (isFullScreen.value) {
      document.exitFullscreen();
      height.value = initialHeight;
    } else {
      const rootEle = document.documentElement;
      rootEle.requestFullscreen().then(() => {
        height.value = window.screen.availHeight;
      });
    }
    isFullScreen.value = !isFullScreen.value;
  }

  return { height, dragStatus, isFullScreen, startDrag, endDrag, switchFullScreen };
}

function useSizeChange({ dom = null as Nullable<HTMLElement>, initialWidth = 800, initialHeight = 600 }){
  const size = reactive({
    width: initialWidth,
    height: initialHeight,
  })

  watch(size, throttle(changeSize, 1000))

  function changeSize({ width, height }: { width: number; height: number }) {
    if(dom){
      dom.style.width = (width || size.width) + 'px'
      dom.style.height = (height || size.height) + 'px'
    }
  }
  
  return { size }
}

export { useAutoSize, usePanelSize, useSizeChange }