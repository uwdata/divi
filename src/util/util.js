import { Right, Left, Top } from '../state/constants';
import { sum } from 'd3-array';

export function copyElement(element) {
    const newElement = element.cloneNode(true);
    for (const [key, value] of Object.entries(element)) {
      newElement[key] = value;
    }
  
    return newElement;
  }

export function computeCenterPos(element, orient) {
  const offset = orient === Right || orient === Left ? element.clientRect.width / 2 : element.clientRect.height / 2;
  return element.clientRect[orient] + (orient === Left || orient === Top ? offset : -offset);
}

export function computeBounds(element, orient) {
  return orient === Right || orient === Left 
  ? [element.clientRect.left, element.clientRect.right] 
  : [element.clientRect.top, element.clientRect.bottom];
}

export function compareTickStyles(element1, element2) {
  // if (element1.clientRect.height !== element2.clientRect.height && 
  //     element1.clientRect.width !== element2.clientRect.width &&
  //     !matchAll) {
  //   return false;
  // }

  const style1 = window.getComputedStyle(element1);
  const style2 = window.getComputedStyle(element2);

  for (const key of style1) {
    // if (key === 'stroke-width') continue;
    if (style1[key] !== style2[key]) return false;
  }

  return true;
}

export function flattenRGB(rgb) {
  return sum(rgb.replace(/[^\d,]/g, '').split(','));
}
