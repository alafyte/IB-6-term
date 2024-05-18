import express from 'express';
import fileUpload from './upload';
import {embedMessage, extractMessage, getColorMatrix} from "./lsb";
import {join, basename, extname} from 'path';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.redirect('/embedded');
})

app.get('/embedded', (req, res) => {
    res.render('embedded');
});

app.post('/embedded', fileUpload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const fileName = basename(req.file.filename);
    const extName = extname(req.file.filename);

    const message = req.body.message;
    const lsbOutputPath = join('files', fileName + 'embedded' + extName);

    await embedMessage(filePath, message, lsbOutputPath, req.body.method);
    let result: string = await extractMessage(lsbOutputPath, req.body.method);

    if (req.body.matrix !== undefined) {
        const matrixOriginalOutputPath = join('files', fileName + 'origmatrix' + extName);
        const matrixOutputPath = join('files', fileName + 'embmatrix' + extName);
        getColorMatrix(filePath, matrixOriginalOutputPath);
        getColorMatrix(lsbOutputPath, matrixOutputPath);
    }
    return res.status(200).json({result});
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
