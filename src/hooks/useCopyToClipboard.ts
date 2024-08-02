import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
interface Options {
  target?: HTMLElement;
}

export function useCopyToClipboard({ onSuccess = ()=>{}, onFail = ()=>{} }) {
  const clipboardRef = ref();

  watch(
    () => clipboardRef.value,
    (str?: string) => {
      if (str) {
        if (copyTextToClipboard(str)) {
          onSuccess?.()
        } else {
          onFail?.()
        }
        clipboardRef.value = '';
      }
    }
  );

  function copy(keyword: string) {
    if (keyword) {
      clipboardRef.value = keyword;
    } else {
      message.warning('请输入要复制的内容！');
    }
  }

  return { clipboardRef, copy };
}

export function copyTextToClipboard(input: string, { target = document.body }: Options = {}) {
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement;

  element.value = input;

  element.setAttribute('readonly', '');

  (element.style as any).contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt';

  const selection = document.getSelection();
  let originalRange;
  if (selection && selection.rangeCount > 0) {
    originalRange = selection.getRangeAt(0);
  }

  target.append(element);
  element.select();

  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch (e) {
    //@ts-ignore
    throw new Error(e);
  }

  element.remove();

  if (originalRange && selection) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  if (previouslyFocusedElement) {
    (previouslyFocusedElement as HTMLElement).focus();
  }
  return isSuccess;
}

function copySuccess() {
  message.success('复制成功！');
}
function copyError() {
  message.success('复制失败！');
}
