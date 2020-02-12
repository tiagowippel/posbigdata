const rp = require("request-promise");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const fs = require("fs");

Promise.each(
    new Array(100).fill(0).map((item, k) => {
        return {
            uri: `https://www.tecmundo.com.br/novidades?page=${k + 1}`,
            transform: body => {
                return cheerio.load(body);
            }
        };
    }),
    function(options, index, arrayLength) {
        return rp(options).then($ => {
            return Promise.all(
                $(".tec--list")
                    .first()
                    .find(".tec--card__title__link")
                    .toArray()
                    .map((item, k) => {
                        const options = {
                            uri: $(item).attr("href"),
                            transform: body => {
                                return cheerio.load(body);
                            }
                        };

                        return rp(options).then($ => {
                            console.log(k, options.uri);

                            return new Promise(resolve => {
                                let txt = "";
                                $(".tec--article__body")
                                    //.find("p")
                                    .children()
                                    .each((i, item) => {
                                        if ("p h2".includes(item.name)) {
                                            const text = $(item).text();
                                            if (
                                                text !==
                                                "Cupons de desconto TecMundo:"
                                            ) {
                                                //console.log(text);
                                                txt += text + "\n";
                                            }
                                        }
                                    });

                                const filename = options.uri.split("/");

                                fs.writeFile(
                                    ".\\news\\" +
                                        filename[filename.length - 1] +
                                        ".txt",
                                    txt,
                                    err => {
                                        console.log(err);

                                        resolve();
                                    }
                                );
                            });

                            return;

                            const aux = $(".tec--article__header-grid");

                            console.log(
                                aux.find(".tec--article__header__title").text()
                            );
                            console.log(
                                aux
                                    .find(".tec--timestamp__item")
                                    .first()
                                    .text()
                            );
                        });
                    })
            ).then(function(result) {
                console.log("Done!");
            });
        });
    }
).then(function(result) {
    console.log("Done!");
});
