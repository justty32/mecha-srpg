const errors = data.diagnostics.filter((d) => d.severity === 'error');
$('validation-status').textContent = errors.length
  ? `${partial ? '未完成 · ' + data.attachments.length + '/' + data.orders.orders.length + ' 件 · ' : '未通過 · '}${errors.length} 項問題（紅區或缺件清單）`
  : `通過 · ${data.attachments.length} 件來源 / 指定動作 21 點診斷`;
$('validation-status').classList.toggle('error', errors.length > 0);
for (const d of data.diagnostics) {
  const li = document.createElement('li'),
    button = document.createElement('button');
  button.textContent = `[${d.code}] ${d.ids.join(', ')} · ${d.message}${d.pose ? ` / ${d.pose} #${d.sample ?? 0}` : ''}`;
  button.onclick = () => {
    pause();
    if (d.pose && poses.some((p) => p.id === d.pose)) $('pose').value = d.pose;
    state.t = (d.sample ?? 0) / 20;
    select(d.ids.find((id) => attachments.has(id)) || d.ids[0]);
  };
  li.append(button);
  $('diagnostics').append(li);
}
