class UrlMappings {

    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(redirect:"/frontend/index.html")
        "500"(view:'/error')
        "404"(view:'/notFound')

        "/api/books"(resources:"book")
        "/api/authors"(resources:"author")

    }
}
