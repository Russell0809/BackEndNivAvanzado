const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const port = 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta GET para verificar que el servidor está funcionando.
app.get('/', (req, res) => {
    res.send('Servidor en marcha. Usa POST para enviar un correo.');
});

// Ruta POST para enviar correos.
app.post('/sendemail', upload.single('file'), async (req, res) => {   
    try {
        let errores = []
        let userMessage = req.body.messageBody || "Mensaje predeterminado si no se envía uno";
        let To = req.body.To;
        let Subject = req.body.Subject;

        if (!req.body.To || req.body.To.trim() === '') {
            errores.push("El campo 'Para' es obligatorio y no puede estar vacío.");
        }
        
        if (!req.body.Subject || req.body.Subject.trim() === '') {
            errores.push("El campo 'Asunto' es obligatorio y no puede estar vacío.");
        }
        
        if (errores.length > 0) {
            return res.status(400).send(errores.join(' '));
        }        

        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'russell.dr72@gmail.com',  
                pass: 'qind ohfq kaxp qleb'    
            }
        });    

        let mailOptions = {
            from: 'russell.dr72@gmail.com',
            to: To,
            subject: Subject,
            text: userMessage,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer
                }
            ]
        };

        // Enviando el correo.
        let info = await transporter.sendMail(mailOptions);

        // Respondiendo con éxito si el correo se envía correctamente.
        res.send(`Correo enviado: ${info.response}`);
    }catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).send("Hubo un error al enviar el correo.");
    }
        
});

// Iniciando el servidor Express en el puerto especificado.
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});