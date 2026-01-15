const moduleBuiltin = typeof window !== 'undefined' && window.require
  ? window.require('module')
  : require('module');

const fallbackFilename = __filename;

const safeCreateRequire = (filename) => {
  try {
    return moduleBuiltin.createRequire(filename);
  } catch (error) {
    return moduleBuiltin.createRequire(fallbackFilename);
  }
};

moduleBuiltin.createRequire = safeCreateRequire;

export const createRequire = safeCreateRequire;
export default moduleBuiltin;