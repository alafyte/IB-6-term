import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {Document, Packer, Paragraph, TextRun} from 'docx';
import {
    extractMessageLL,
    extractMessageKerning,
    extractTextFromDocx,
    lineLengthChanging,
    modifyKerning
} from "./textSteganography";
import path from "path";
import multer from 'multer';


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const upload = multer({dest: 'uploads/'});


app.get('/', (req: Request, res: Response) => {
    res.redirect('/line-length');
});

app.get('/line-length', (req: Request, res: Response) => {
    res.render('line-length');
})

app.post('/line-length', async (req: Request, res: Response) => {
    try {
        const {text, message} = req.body;

        if (!text || !message) {
            return res.status(400).send('Text and message are required');
        }

        const encodedText = lineLengthChanging(text, message);

        const paragraphs = encodedText.map(text => new Paragraph({
            children: [
                new TextRun({
                    text: text,
                    font: 'Times New Roman',
                    size: 28,
                }),
            ],
        }));

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Disposition', 'attachment; filename=encoded.docx');
        res.send(buffer);
    } catch (err) {
        res.send(`<h1>Исходный текст не подходит для внедрения</h1>`);
    }
});

app.post('/line-length-extract', upload.single('docx'), async (req, res) => {
    const filePath = req.file!.path;
    const text = await extractTextFromDocx(filePath);
    const result = extractMessageLL(text);
    res.send({result});
});

app.get('/kerning', (req: Request, res: Response) => {
    res.render('kerning');
})


app.post('/kerning', async (req: Request, res: Response) => {
    try {
        const {text, message} = req.body;

        if (!text || !message) {
            return res.status(400).send('Text and message are required');
        }

        const encodedText = modifyKerning(text, message);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        alignment: 'both',
                        children: [
                            new TextRun({
                                text: encodedText,
                                font: 'Times New Roman',
                                size: 28
                            }),
                        ],
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Disposition', 'attachment; filename=encoded.docx');
        res.send(buffer);
    } catch (err) {
        res.send(`<h1>Исходный текст не подходит для внедрения</h1>`);
    }
});


app.post('/kerning-extract', upload.single('docx'), async (req, res) => {
    const filePath = req.file!.path;
    const text = await extractTextFromDocx(filePath);
    const result = extractMessageKerning(text);
    res.send({result});
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});