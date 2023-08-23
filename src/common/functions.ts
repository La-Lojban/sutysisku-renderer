function dispatchCustomEvent(eventKey: string) {
  const event = new CustomEvent(eventKey, {
    bubbles: true,
    cancelable: true,
  });

  document.dispatchEvent(event);
}

function getElement(elem?: string | Element | null): Element | null {
  return elem ? (typeof elem === 'string' ? document.querySelector(elem) : elem) : null;
}

export { dispatchCustomEvent, getElement };
