import fs from 'fs';
import path from 'path';
import { Error } from 'tinify/lib/tinify/Error';
import ejs from 'ejs';
import JsReport from 'jsreport-core';
import { promisify } from 'util';

export const createProdListPDF = async (
    prodList: Array<any>
) => {
    return new Promise(async (resolve, reject) => {
        function base64_encode(file: any) {
            // read binary data
            var bitmap: Buffer = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return Buffer.from(bitmap).toString('base64');
        }

        const estilo = fs.readFileSync(path.join("views", "reports", "cajaList", "styles.css"), 'utf8')
        const logo = base64_encode(path.join("public", "images", "invoices", "logo.png"))

        const dateNow = new Date()

        const fileName = `prodList-${dateNow}.pdf`
        const location = path.join("public", "prod-list", fileName)

        const datos = {
            logo: 'data:image/png;base64,' + logo,
            style: "<style>" + estilo + "</style>",
            prodList: prodList
        }

        const jsreport = JsReport({
            extensions: {
                "chrome-pdf": {
                    "launchOptions": {
                        "args": ["--no-sandbox"]
                    }
                }
            }
        })

        jsreport.use(require('jsreport-chrome-pdf')())

        const writeFileAsync = promisify(fs.writeFile)

        await ejs.renderFile(path.join("views", "reports", "prodList", "index.ejs"), datos, async (err, data) => {
            if (err) {
                console.log('err', err);
                throw new Error("Algo salio mal")
            }

            await jsreport.init()
            jsreport.render({
                template: {
                    content: data,
                    name: 'lista',
                    engine: 'none',
                    recipe: 'chrome-pdf',
                    chrome: {
                        "landscape": false,
                        "format": "A4",
                        "scale": 0.8,
                        displayHeaderFooter: true,
                        marginBottom: "2cm",
                        footerTemplate: "<div style='font-size: 14px;text-align: center;widht: 100%;'>Página&nbsp;<span class='pageNumber'></span>&nbsp;de&nbsp;<span class='totalPages'></span></div>",
                        marginTop: "0.5cm",
                        headerTemplate: ""
                    },

                },
            })
                .then(async (out) => {
                    await writeFileAsync(location, out.content)
                    await jsreport.close()
                    const dataFact = {
                        filePath: location,
                        fileName: fileName
                    }
                    resolve(dataFact)
                })
                .catch((e) => {
                    reject(e)
                });
        })
    })
}