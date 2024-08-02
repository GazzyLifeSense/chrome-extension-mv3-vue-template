
import { ref } from 'vue';

// 自动调整popover位置
export function useAutoPlacement({ initialPlacement, width = 900 }:{ initialPlacement: string, width: number }) {
  const adjustedPlacement: any = ref(initialPlacement);

  function adjustPlacement(e: MouseEvent) {
    let prefix = '';

    const yt = e.clientY;
    const yb = window.screen.height - yt;

    prefix = yb >= yt ? 'bottom' : 'top';

    const xl = e.clientX;
    const xr = window.screen.width - xl;
    xl < width && xr < width
      ? (adjustedPlacement.value = prefix)
      : xl < width
      ? (adjustedPlacement.value = `${prefix}Left`)
      : (adjustedPlacement.value = `${prefix}Right`);
  }

  return { adjustedPlacement, adjustPlacement };
}
