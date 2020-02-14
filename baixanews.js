const rp = require("request-promise");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const fs = require("fs");

Promise.each(
    new Array(1).fill(0).map((item, k) => {
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

                            const newsTitle = $(
                                ".tec--article__header__title"
                            ).text();

                            return rp(
                                `https://disqus.com/embed/comments/?base=default&f=tecmundo&t_u=${options.uri}&t_e=${newsTitle} - TecMundo&t_d=${newsTitle}&t_t=${newsTitle} - TecMundo&s_o=default&l=pt#version=96f5ca00a04502984667ea244c3ff477`
                            ).then(aaa => {
                                console.log(aaa);
                            });

                            // return new Promise(resolve => {
                            //     let txt = "";
                            //     $(".tec--article__body")
                            //         //.find("p")
                            //         .children()
                            //         .each((i, item) => {
                            //             if ("p h2".includes(item.name)) {
                            //                 const text = $(item).text();
                            //                 if (
                            //                     text !==
                            //                     "Cupons de desconto TecMundo:"
                            //                 ) {
                            //                     //console.log(text);
                            //                     txt += text + "\n";
                            //                 }
                            //             }
                            //         });

                            //     const filename = options.uri.split("/");

                            //     fs.writeFile(
                            //         ".\\news\\" +
                            //             filename[filename.length - 1] +
                            //             ".txt",
                            //         txt,
                            //         err => {
                            //             console.log(err);

                            //             resolve();
                            //         }
                            //     );
                            // });

                            // return;

                            //const aux = $("posts");
                            //const aux = $("iframe").attr("src");
                            //console.log(aux);

                            // const aux = $(".tec--article__header-grid");

                            // console.log(
                            //     aux.find(".tec--article__header__title").text()
                            // );
                            // console.log(
                            //     aux
                            //         .find(".tec--timestamp__item")
                            //         .first()
                            //         .text()
                            // );
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
