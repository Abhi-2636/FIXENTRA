const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = process.env.SERVERLESS ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'uploads');

const ensureDirectory = (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
};

const sanitizeBaseName = (filename) => {
    const base = path.basename(filename, path.extname(filename));
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'upload';
};

const makeUploader = (folder) => {
    const destination = path.join(uploadRoot, folder);
    ensureDirectory(destination);

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, destination),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
            cb(null, `${Date.now()}-${sanitizeBaseName(file.originalname)}${ext}`);
        }
    });

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
                cb(null, true);
                return;
            }
            cb(new Error('Only image uploads are allowed.'));
        }
    });
};

module.exports = {
    issueUpload: makeUploader('issues'),
    providerUpload: makeUploader('providers'),
    serviceUpload: makeUploader('services')
};
