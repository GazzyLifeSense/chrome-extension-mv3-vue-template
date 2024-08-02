//获取屏幕高度
export function handleScreenHeightChange(): number {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

//获取屏幕宽度
export function handleScreenWidthChange(): number {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

// 新开居中窗口
export const popupCenter = ({ url, target, w, h }: { url: string, target: string, w: number, h: number }) => {
  // 屏宽高
  const width = window.screen.width;
  const height = window.screen.height;

  const left = (width - w) / 2;
  const top = (height - h) / 2;

  const newWindow = window.open(
    url,
    target,
    `
      innerWidth=${w}, 
      innerHeight=${h}, 
      top=${top}, 
      left=${left}
      `
  );

  return newWindow;
};
