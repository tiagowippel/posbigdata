const rp = require("request-promise");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const fs = require("fs");
const random_useragent = require("random-useragent");

const arr = new Array(1000).fill(0);

Promise.each(arr, (item, index) => {
    index += 180;
    return Promise.all(
        new Array(10).fill(0).map((item, k) => {
            return rp(`https://www.gutenberg.org/files/${index * 10 + k + 1}/`)
                .then(body => {
                    const $ = cheerio.load(body);

                    return Promise.all(
                        $("a")
                            .toArray()
                            .filter(item => {
                                const x = $(item).attr("href");
                                return x.includes(".txt");
                            })
                            .map(item => {
                                const x = $(item).attr("href");
                                return rp(
                                    `https://www.gutenberg.org/files/${index *
                                        10 +
                                        k +
                                        1}/${x}`
                                ).then(body => {
                                    console.log(index * 10 + k + 1);

                                    fs.writeFileSync(
                                        `.\\livros\\${index * 10 + k + 1}.txt`,
                                        body
                                    );
                                });
                            })
                    );
                })
                .catch(err => {
                    if (err.statusCode === 403) return;
                    else throw new Error(err);
                });
        })
    );
});

return;

Promise.each(arr, (item, index) => {
    return rp(
        `https://www.gutenberg.org/ebooks/search/?sort_order=downloads&start_index=${(index +
            40) *
            25 +
            1}`
    )
        .then(body => {
            console.log((index + 40) * 25 + 1);

            const $ = cheerio.load(body);

            return Promise.each(
                $(".booklink")
                    .toArray()
                    .map(item => {
                        const link = $(item)
                            .find("a")
                            .first()
                            .attr("href");

                        return link;
                    }),
                (link, index) => {
                    return rp(`https://www.gutenberg.org${link}`).then(body => {
                        const $ = cheerio.load(body);

                        return Promise.all(
                            $(".link")
                                .toArray()
                                .map(item => {
                                    const link = $(item).attr("href");

                                    if (link.includes(".txt")) {
                                        return rp(
                                            `https://www.gutenberg.org${link}`
                                            // {
                                            //     headers: {
                                            //         "User-Agent": random_useragent.getRandom()
                                            //     }
                                            // }
                                        ).then(body => {
                                            console.log(index, link);

                                            const a = link.split("/");

                                            fs.writeFileSync(
                                                `.\\livros\\${a[a.length - 1]}`,
                                                body
                                            );
                                        });
                                    }
                                })
                        );
                    });
                }
            );
        })
        .then(res => {
            // return new Promise(resolve => {
            //     setTimeout(() => {
            //         resolve();
            //     }, 1);
            // });
        });
}).catch(err => {
    console.log("err:", err.message);
});
