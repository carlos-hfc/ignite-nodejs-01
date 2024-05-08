import { parse } from 'csv-parse'
import fs from 'node:fs'

const csvPath = new URL("./tasks.csv", import.meta.url)

const createStream = fs.createReadStream(csvPath)

const fileParse = parse({
  delimiter: ",",
  skipEmptyLines: true,
  fromLine: 2
})

export async function convertCsv() {
  const lines = createStream.pipe(fileParse)

  for await (const item of lines) {
    const [title, description] = item

    const response = await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
      })
    })

    console.log(title, response.ok)

    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

convertCsv()