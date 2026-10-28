import { createStudio } from './studio.js';

export function boot(delivery = null) {
  const query = selector => document.querySelector(selector);
  let studio;
  let status = 'WAITING_FOR_FROZEN_MODEL';
  let failure = null;
  let model = null;
  try {
    studio = createStudio(query('#scene'));
    for (const button of document.querySelectorAll('[data-camera]')) {
      button.addEventListener('click', () => setCamera(button.dataset.camera));
    }
    query('#fit').addEventListener('click', () => setCamera('front'));
    query('#dpr').addEventListener('change', event => studio.dpr(event.target.value));
    query('#status').textContent = '模型整備中';
    if (delivery) delivery.mount({ studio, setCamera, onReady: value => { model = value; status = 'READY'; query('#status').textContent = '展示就緒'; query('#pending').hidden = true; setCamera('iso'); } });
  } catch (error) {
    failure = error.message;
    status = 'ERROR';
    query('#status').textContent = '載入失敗';
    query('#pending strong').textContent = '無法載入展示';
    query('#pending p').textContent = failure;
    throw error;
  }
  function setCamera(name) {
    studio.preset(name);
    const labels = { front: '正面', side: '側面', back: '背面', iso: '斜角' };
    query('#view-name').textContent = labels[name];
    for (const button of document.querySelectorAll('[data-camera]')) button.setAttribute('aria-pressed', String(button.dataset.camera === name));
  }
  window.__mech3d = {
    snapshot: () => ({ status, failure, ...studio?.snapshot(), ...model?.snapshot() }),
    pixels: () => studio.pixelProbe(),
    camera: setCamera,
    select: id => model.select(id),
    visible: (id, value) => model.visible(id, value),
    solo: id => model.solo(id),
    pose: pose => model.pose(pose),
    explode: value => model.explode(value),
    project: id => model.project(id),
    opticsVisibility: () => model.opticsVisibility(),
  };
}
