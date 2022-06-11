import path from 'path'
import tinify from 'tinify'
tinify.key = "bbb5LGP5xPyXgrhYyS8BzB8NFfkLchtv";
const OptimizeImg = async (file: string) => {
    const directory = path.join(__dirname, '..', '..', 'public', 'images', 'products', file)

    const source = tinify.fromFile(directory);
    const resized = source.resize({
        method: "cover",
        width: 600,
        height: 600
    });
    await resized.toFile(directory);
}

export = OptimizeImg