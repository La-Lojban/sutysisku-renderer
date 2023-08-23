import { amend, render } from '../../src';
import patchDOM from '../../src/patcher-mini';
describe('findOrCreate method', () => {
  let htmlFrom: HTMLElement;
  let htmlTo: HTMLElement;
  let root: HTMLElement;
  beforeAll(async () => {
    root = document.createElement('div');
    root.id = 'root';
  });

  //TODO: test requestanimationframe
  it('render from scratch should output HTMLElement', async () => {
    htmlFrom = render('div', {
      className: 'testFrom',
      children: [render('div', { textContent: 'Hello world!' })],
    });
    expect(htmlFrom.outerHTML).toEqual('<div class="testFrom"><div>Hello world!</div></div>');
  });
  it('render over another HTMLElement should not overwrite the initial HTMLElement', async () => {
    htmlFrom = render('div', {
      className: 'testFrom',
      children: [render('div', { textContent: 'Hello world!' })],
    });
    htmlTo = render(htmlFrom, {
      children: [render('div', { className: 'testTo', textContent: 'Hello new world!' })],
    });
    expect(htmlFrom.outerHTML).toEqual('<div class="testFrom"><div>Hello world!</div></div>');
    expect(htmlTo?.children[0].className).toEqual('testTo');
  });
  it('patchDOM should mutate the source element', async () => {
    htmlFrom = render('div', {
      className: 'testFrom',
      children: [render('div', { textContent: 'Hello world!' })],
    });
    htmlTo = render('div', {
      className: 'testTo',
      children: [render('div', { className: 'testTo', textContent: 'Hello new world!' })],
    });
    expect(htmlFrom.outerHTML).toEqual('<div class="testFrom"><div>Hello world!</div></div>');
    patchDOM(htmlFrom, htmlTo);
    expect(htmlFrom.outerHTML).toEqual('<div class="testTo"><div class="testTo">Hello new world!</div></div>');
  });
  it('patchDOM: input value changes', async () => {
    const firstHTML = '<input type="number" value="8" min="0" max="255" name="width" />';
    const secondHTML = '<input type="color" value="#ff00ff" />';
    htmlFrom = document.createElement('input');
    htmlFrom.outerHTML = firstHTML;
    htmlTo = document.createElement('input');
    htmlTo.outerHTML = secondHTML;
    patchDOM(htmlFrom, htmlTo);
    expect(htmlFrom.outerHTML).toEqual(htmlTo.outerHTML);
    htmlFrom.outerHTML = secondHTML;
    htmlTo.outerHTML = firstHTML;
    patchDOM(htmlFrom, htmlTo);
    expect(htmlFrom.outerHTML).toEqual(htmlTo.outerHTML);
  });
  it('amend should mutate the source element', async () => {
    htmlFrom = render('div', {
      className: 'testFrom',
      children: [render('div', { textContent: 'Hello world!' })],
    });
    expect(htmlFrom.outerHTML).toEqual('<div class="testFrom"><div>Hello world!</div></div>');
    amend(htmlFrom, {
      className: 'testTo',
    });
    expect(htmlFrom.outerHTML).toEqual('<div class="testTo"><div>Hello world!</div></div>');
  });
});
