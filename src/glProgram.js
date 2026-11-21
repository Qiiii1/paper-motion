// The sheet and lens programs share one context. Prefer WebGL 2 for the
// half-resolution sampling pattern, with GLSL ES 1.00 on older devices.
export function makeProgram(gl, vertex, fragment) {
  const modern = typeof gl.texStorage2D === 'function';
  const program = gl.createProgram();
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
      const frag = type === gl.FRAGMENT_SHADER;
      const header = frag
        ? '#define varying in\n#define texture2D texture\nout highp vec4 pixelColor;\n#define gl_FragColor pixelColor\n'
        : '#define attribute in\n#define varying out\n';
      const shader = gl.createShader(type);
      gl.shaderSource(shader,modern ? '#version 300 es\n'+header+source : source);
      gl.compileShader(shader);
      const ok = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
      const message = ok ? '' : gl.getShaderInfoLog(shader);
      gl.attachShader(program,shader);
      gl.deleteShader(shader);
      if (!ok) throw Error(message);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    return program;
  } catch (error) {gl.deleteProgram(program);throw error}
}
