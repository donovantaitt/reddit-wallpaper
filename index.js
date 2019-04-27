const request = require('request')
const rp = require('request-promise-native')
const fs = require('fs')
const os = require('os')

const wallpaperDir = `${os.userInfo().homedir}/Pictures/Wallpapers/`

// https://stackoverflow.com/a/12751657
const download = (uri, filename) => request(uri).pipe(fs.createWriteStream(filename, { flags: 'wx' }))

const getPosts = async (subreddit, time, limit) => {
    const res = JSON.parse(await rp(`https://www.reddit.com/r/${subreddit}/top.json?sort=top&t=${time}&limit=${limit}`))
    return res.data.children
}

const handleDownload = (post) => {
    const image = post.data.url
    const filePath = `${wallpaperDir}${post.data.id}.png`
    
    const isSfw = post.data.whitelist_status !== 'promo_adult_nsfw'
    const isImage = post.data.post_hint === 'image'
    const isLargeEnough = post.data.preview && post.data.preview.images[0].source.width > 950

    if (isSfw && isImage && isLargeEnough) {
        try {
            fs.accessSync(filePath)
            console.log('already downloaded -- skipping...')
        } catch (err) {
            console.log('downloading...')
            download(image, filePath)
        }
    }
}

const setImagesToWallpaper = async (subreddit, time, limit='100') => {

    const posts = await getPosts(subreddit, time, limit)
    !fs.existsSync(wallpaperDir) && fs.mkdirSync(dirname, { recursive: true })
    
    for (let post of posts) {
        handleDownload(post)
    }
}

const subreddits = process.argv.slice(2)

const times = ['day', 'month', 'week', 'year', 'all']

for (let time of times) {
    for (let sub of subreddits) {
        setImagesToWallpaper(sub, time)
    }
}
