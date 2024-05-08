import { randomUUID } from "node:crypto"

import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js"

const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query

      const tasks = database.select("tasks", search ? {
        title: search,
        description: search,
      } : null)

      return response.end(JSON.stringify(tasks))
    }
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { title, description } = request.body

      if (
        (!title || (title && !title.trim())) ||
        (!description || (description && !description.trim()))
      ) {
        return response
          .writeHead(400)
          .end(JSON.stringify({
            error: "Title and description are required"
          }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      }

      database.insert("tasks", task)

      return response.writeHead(201).end()
    }
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params

      const exists = database.find("tasks", id)

      if (!exists) {
        return response
          .writeHead(404)
          .end(JSON.stringify({
            error: "Task not found."
          }))
      }
      
      database.delete("tasks", id)

      return response.writeHead(204).end()
    }
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params

      const exists = database.find("tasks", id)

      if (!exists) {
        return response
          .writeHead(404)
          .end(JSON.stringify({
            error: "Task not found."
          }))
      }

      const { title, description } = request.body

      database.update("tasks", id, {
        title,
        description
      })

      return response.writeHead(204).end()
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params

      const exists = database.find("tasks", id)

      if (!exists) {
        return response
          .writeHead(404)
          .end(JSON.stringify({
            error: "Task not found."
          }))
      }

      database.completed("tasks", id)

      return response.writeHead(204).end()
    }
  },
]