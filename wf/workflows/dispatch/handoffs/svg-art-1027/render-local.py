"""只用既有 librsvg/cairo；渲染前以 seccomp 禁止網路 syscall。"""
import ctypes as C
import errno
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

source, target = map(Path, sys.argv[1:3])
data = source.read_bytes()
assert not re.search(rb'<!DOCTYPE|<!ENTITY', data, re.I)
root = ET.fromstring(data)
ids = {e.get('id') for e in root.iter() if e.get('id')}
for element in root.iter():
    for key, value in element.attrib.items():
        assert not key.lower().startswith('on')
        if key.split('}')[-1] == 'href':
            assert value.startswith('#') and value[1:] in ids
        for match in re.findall(r'url\(([^)]+)\)', value):
            assert match.strip("'\" ").startswith('#')

assert not any(e.tag.split('}')[-1] in {'script', 'foreignObject', 'image'} for e in root.iter())
_, _, width, height = map(float, root.attrib['viewBox'].split())
# 先設禁網；無過濾能力則失敗，不啟動渲染。
sec = C.CDLL('libseccomp.so.2', use_errno=True)
sec.seccomp_init.argtypes = [C.c_uint32]; sec.seccomp_init.restype = C.c_void_p
sec.seccomp_syscall_resolve_name.argtypes = [C.c_char_p]; sec.seccomp_syscall_resolve_name.restype = C.c_int
sec.seccomp_rule_add.argtypes = [C.c_void_p, C.c_uint32, C.c_int, C.c_uint]
sec.seccomp_load.argtypes = [C.c_void_p]
sec.seccomp_release.argtypes = [C.c_void_p]
ctx = sec.seccomp_init(0x7fff0000)
assert ctx
for name in ['socket', 'socketpair', 'connect', 'bind', 'listen', 'accept', 'accept4', 'sendto', 'sendmsg', 'sendmmsg', 'recvfrom', 'recvmsg', 'recvmmsg']:
    syscall = sec.seccomp_syscall_resolve_name(name.encode())
    if syscall >= 0:
        assert sec.seccomp_rule_add(ctx, 0x00050000 | errno.EPERM, syscall, 0) == 0
assert sec.seccomp_load(ctx) == 0
sec.seccomp_release(ctx)
import socket
try:
    socket.socket()
except PermissionError:
    print('Network syscall block verified before renderer load.')
else:
    raise RuntimeError('Network block failed')
rsvg = C.CDLL('librsvg-2.so.2')
cairo = C.CDLL('libcairo.so.2')
gobject = C.CDLL('libgobject-2.0.so.0')
rsvg.rsvg_handle_new_from_data.argtypes = [C.c_void_p, C.c_size_t, C.POINTER(C.c_void_p)]
rsvg.rsvg_handle_new_from_data.restype = C.c_void_p
class Rectangle(C.Structure):
    _fields_ = [('x', C.c_double), ('y', C.c_double), ('width', C.c_double), ('height', C.c_double)]
rsvg.rsvg_handle_render_document.argtypes = [C.c_void_p, C.c_void_p, C.POINTER(Rectangle), C.POINTER(C.c_void_p)]
rsvg.rsvg_handle_render_document.restype = C.c_int
cairo.cairo_image_surface_create.argtypes = [C.c_int, C.c_int, C.c_int]; cairo.cairo_image_surface_create.restype = C.c_void_p
cairo.cairo_create.argtypes = [C.c_void_p]; cairo.cairo_create.restype = C.c_void_p
cairo.cairo_status.argtypes = [C.c_void_p]
cairo.cairo_surface_write_to_png.argtypes = [C.c_void_p, C.c_char_p]
cairo.cairo_destroy.argtypes = [C.c_void_p]
cairo.cairo_surface_destroy.argtypes = [C.c_void_p]
gobject.g_object_unref.argtypes = [C.c_void_p]
error = C.c_void_p()
buffer = C.create_string_buffer(data)
handle = rsvg.rsvg_handle_new_from_data(buffer, len(data), C.byref(error))
assert handle and not error.value
surface = cairo.cairo_image_surface_create(0, int(width), int(height))
canvas = cairo.cairo_create(surface)
viewport = Rectangle(0, 0, width, height)
assert rsvg.rsvg_handle_render_document(handle, canvas, C.byref(viewport), C.byref(error)) and not error.value
assert cairo.cairo_status(canvas) == 0
assert cairo.cairo_surface_write_to_png(surface, str(target).encode()) == 0
cairo.cairo_destroy(canvas); cairo.cairo_surface_destroy(surface); gobject.g_object_unref(handle)
print(f'Rendered {source} -> {target} ({int(width)}x{int(height)}), transparent PNG')
