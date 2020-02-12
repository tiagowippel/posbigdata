const rp = require("request-promise");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const fs = require("fs");

const arr = new Array(10).fill(0);

const random_useragent = require("random-useragent");

Promise.each(arr, (item, index) => {
    return rp(
        `https://www.gutenberg.org/ebooks/search/?sort_order=downloads&start_index=${index *
            25 +
            1}`
    )
        .then(body => {
            console.log(index);

            const $ = cheerio.load(body);

            return Promise.each(
                $(".booklink")
                    .toArray()
                    .map((item, k) => {
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
                                            console.log(link);

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
