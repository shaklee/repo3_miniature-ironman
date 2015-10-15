package library

import grails.rest.Resource

@Resource(uri='/api/authors', formats=['json'])
class Author {

    String name
    String surname

    static hasMany = [books: Book]

    String getCompleteName() {
        "$name $surname"
    }

    String toString() {
        completeName
    }

    static constraints = {
        name maxSize: 30, blank: false, nullable: false
        surname maxSize: 50, blank: false, nullable: false
    }
}
