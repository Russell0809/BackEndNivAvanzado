const express = require('express');           
const puppeteer = require('puppeteer');       // Biblioteca para el web scraping en navegadores headless
const bodyParser = require('body-parser');    // Middleware para analizar el cuerpo de las solicitudes entrantes

const app = express();                        
const port = 3000;                          

// Middleware para analizar solicitudes JSON y datos codificados en la URL
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ruta POST para realizar el scraping
app.post('/scrape', async (req, res) => {
                 
    // Obteniendo la URL del cuerpo de la solicitud
    let url = req.body.url;       

    let browser;
    try {
        // Lanzando Puppeteer y abriendo una nueva página
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Navegando a la URL proporcionada y esperando hasta que todas las conexiones de red estén inactivas
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extrayendo datos de los elementos con las clases CSS especificadas
        const resultsFz18px = await page.$$eval('.D\\(ib\\).Fz\\(18px\\)', nodes => nodes.map(n => n.innerText));
        const resultsMend20px = await page.$$eval('.D\\(ib\\).Mend\\(20px\\)', nodes => nodes.map(n => n.innerText));

        // Dividir el resultado para obtener los datos de interés
        const sectionedResults = resultsMend20px[0].split(' ');

        // Usando una expresión regular para extraer el valor principal, el signo y el cambio
        const regex = /([\d,]+\.\d+)([+-])(\d+\.\d+)/;
        const matches = sectionedResults[0].match(regex);
        let cierre, signo, cambio, varUnitaria;
        if (matches) {
            cierre = matches[1];
            // signo = matches[2];
            // cambio = matches[3];

            // Concatenando el signo y el cambio
            varUnitaria = matches[2].concat(" ", matches[3]);
        }

        // Enviando la respuesta con los datos extraídos
        res.json({
            Indice: resultsFz18px[0],
            Cierre: cierre,
            VarUnitaria: varUnitaria,
            PorVarUnitaria: sectionedResults[1]
        });

    } catch (error) {
        // Manejo de errores durante el scraping
        res.json({ "error": "Error al procesar los datos del scraping" });
        console.error('Error al procesar los datos del scraping:', error);
    } finally {
        // Cerrando Puppeteer, independientemente de si fue exitoso o hubo un error
        if (browser) {
            await browser.close();
        }
    }
});

// Iniciando el servidor en el puerto definido
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});