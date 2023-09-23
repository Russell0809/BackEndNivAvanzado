const express = require('express')
const qr = require('qrcode')

const app = express()
const port = 3002

// Habilitar el middleware para analizar el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }));

// Página inicial con el formulario
app.get("/NewQr", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Generador QR</title>
            </head>
            <body>
                <h1>Ingrese una URL</h1>
                <form action="/getQR" method="POST">
                    <input type="text" name="url" id="url" required placeholder="https://ejemplo.com">
                    <input type="submit" value="Generar QR">
                </form>
            </body>
        </html>
    `);
});

app.post("/getQR", (req, res) => {
    const dataUrl = req.body.url;

    const options = {
        errorCorrectionLevel : "H",
        type : 'image/jpeg',
        renderOpts : {
            quality : 0.5
        }
    };

    qr.toDataURL(dataUrl, options, (err, qrImg) => {
        if(err) {
            console.log("Error al generar el codigo QR: ", err);
            res.status(500).json({Error: "Error al generar el codigo QR"});
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.send(`
                <html>
                    <head>
                        <title>Generador de QR</title>
                    </head>
                    <body>
                        <h1>Código QR de la página:</h1>
                        <p>${dataUrl}</p>
                        <img alt="Aqui esta un qr" src="${qrImg}" />
                        <br>
                        <a href="/NewQr">Regresar</a>
                    </body>
                </html>
            `);
        }
    });
});

// Iniciando el servidor Express en el puerto especificado.
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});