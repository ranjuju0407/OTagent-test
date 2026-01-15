const moduleBuiltin = require('module');

const fallbackFilename = __filename;
const originalCreateRequire = moduleBuiltin.createRequire;

moduleBuiltin.createRequire = (filename) => {
  if (typeof filename === 'string' && /^https?:\/\//.test(filename)) {
    return originalCreateRequire(fallbackFilename);
  }

  try {
    return originalCreateRequire(filename);
  } catch (error) {
    return originalCreateRequire(fallbackFilename);
  }
};