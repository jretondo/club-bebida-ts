import fs from 'fs';
import path from 'path';
import { Error } from 'tinify/lib/tinify/Error';
import ejs from 'ejs';
import JsReport from 'jsreport-core';
import { promisify } from 'util';

export const createListPricesPDF = async (
    productos: any
): Promise<{
    filePath: string,
    fileName: string
}> => {
    return new Promise(async (resolve, reject) => {
        //const productos = await productController.pricesProd()

        function base64_encode(file: any) {
            // read binary data
            var bitmap: Buffer = fs.readFileSync(file);
            // convert binary data to base64 encoded string
            return Buffer.from(bitmap).toString('base64');
        }

        const fileName = `preciosList.pdf`

        const location = path.join("public", "caja-lists", fileName)

        const logo = base64_encode(path.join("public", "images", "invoices", "logo.png"))
        const myCss = fs.readFileSync(path.join("public", "css", "bootstrap.min.css"), 'utf8')
        const datos = {
            myCss: `<style>${myCss}</style>`,
            logo: 'data:image/png;base64,' + logo,
            productos: productos
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

        await ejs.renderFile(path.join("views", "reports", "prices", "index.ejs"), datos, async (err, data) => {
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
                        "landscape": true,
                        "format": "Legal",
                        "scale": 0.8,
                        displayHeaderFooter: true,
                        marginBottom: "3cm",

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