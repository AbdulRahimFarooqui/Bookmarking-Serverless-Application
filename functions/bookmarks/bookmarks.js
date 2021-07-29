const { ApolloServer, gql } = require('apollo-server-lambda');
require('events').EventEmitter.defaultMaxListeners = 400;
const faunadb = require('faunadb'),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }

  type Bookmark {
    id: ID!
    url: String!
    desc: String!
  }

  type Mutation {
    addBookmark(url: String!, desc: String!) : Bookmark
    deleteBookmark(id:ID!):String
  }
`

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      try {
        var client = new faunadb.Client({ secret: "fnAEO-aDOnACDGaja6B7fsgB_xz-rmf5DeRkOcBN" });
        var result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url1"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(d => {
          return {
            id: d.ts,
            url: d.data.url,
            desc: d.data.desc,
          }
        })
      }
      catch (err) {
        console.log('err', err);
      }
    }
  },
  Mutation: {
    addBookmark: async (_, { url, desc }) => {
      try {
        var client = new faunadb.Client({ secret: "fnAEO-aDOnACDGaja6B7fsgB_xz-rmf5DeRkOcBN" });
        var result = await client.query(
          q.Create(
            q.Collection('links'),
            {
              data: {
                url,
                desc
              }
            },
          )
        );
          return result.ref.data

      }
      catch (error) {
        console.log(error);
      }
    },
    deleteBookmark: async (_, { id }) => {
      try {
        var client = new faunadb.Client({ secret: "fnAEO-aDOnACDGaja6B7fsgB_xz-rmf5DeRkOcBN" });
        const idNum = Number(id);
          var result = await client.query(
            q.Delete(
              q.Select('ref',
                q.Get(
                  q.Match(q.Index('ts'), idNum)
                )
              )
            )
          )
      }
      catch (err) { console.log(err) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler()
