const express = require('express');
const graphqlHTTP = require('express-graphql');
const GraphQL = require('graphql');
const axios = require('axios');
const types = require('graphql/type');

// 1. Define object types
/*

	Assuming the field you want is NOT a collection of data (array or object), you can use the following structure

	...
	propertyNameFromSource: { type: types.GraphQL(String|Boolean|Float|Int) }
	...

	Note: `propertyNameFromSource` must match the property name you want from the http request, it's used to extract that specific property!

	If the type you want is an object or an array, you have to give it the shape/what it's expecting. EX:

	Assume we want a field called `images` which is an array of objects
	Assume the objects look like this:

		const obj = {
			source: 'www.imagelocation.com',
			ratings: 482,
		}

	Given this structure, inside of the `RedditType`, we could add the following line

		...
		images: { type: customRedditImageType },
		...

	Then define the type above

		const customRedditImageType = new types.GraphQLObjectType({
			name: 'customRedditImageType',
			fields: {
				source: { type: types.GraphQLString },
				ratings: { type: types.GraphQLInt },
			}
		});
*/

/*

Let's define a type for the following structure:

preview: {
	images: [
	  {
	    source: {
			url: "https://i.redditmedia.com/XTxOJUqd0TzyGmxIOw5GkXiY5Mo69Whe0oxT4tAWzoA.jpg?s=a6f81d772dea4ff54e79990f3109ede2",
			width: 800,
			height: 800
	    },
	  },
	]
},

Break down of the new `types` that we need to define

preview: { <---- Since this is an object, we need a new type to define the structure of what we want out of this, (RedditPreviewType)

	here we have a field that's also a collection of data, so we need to let graphql know it's an array/list, since it's an array of objects,
	we also need to define how those objects look and tell graphql it's an array of those object types, (RedditImageType)
	images: [
	  {
	    source: { <---- Same as for preview, we'll call this one RedditImageSourceType

	    	inside here we finally have types that aren't collections, these can be defined like normal
			url: "https://i.redditmedia.com/XTxOJUqd0TzyGmxIOw5GkXiY5Mo69Whe0oxT4tAWzoA.jpg?s=a6f81d772dea4ff54e79990f3109ede2",
			width: 800,
			height: 800
	    },
	  },
	]
},

Defining graphql object types is exactly the same thing as describing HOW the object looks. These types can be nested as much as you want/need

Below is each of these object types defined and implemented properly, to make functional, uncomment the 3 types and remove the single line comment
for the `preview` field in `RedditType`
*/

/* Step 3:
const RedditImageSourceType = new types.GraphQLObjectType({
	name: 'RedditImageSourceType',
	fields: {
		url: { type: types.GraphQLString },
		height: { type: types.GraphQLInt },
		width: { type: types.GraphQLInt },
	},
});
*/

/* Step 2:
const RedditImageType = new types.GraphQLObjectType({
	name: 'RedditImageType',
	fields: { 
		source: { type: RedditImageSourceType },
	},
});
*/

/* Step 1:
const RedditPreviewType = new types.GraphQLObjectType({
	name: 'RedditPreviewType',
	fields: {
		images: { type: new types.GraphQLList(RedditImageType) }
	},
});
*/

const RedditType = new types.GraphQLObjectType({
  name: 'RedditType',
  fields: {
    score: { type: types.GraphQLInt },
    subreddit: { type: types.GraphQLString },
    selftext: { type: types.GraphQLString },
    author: { type: types.GraphQLString },
    thumbnail: { type: types.GraphQLString },
    permalink: { type: types.GraphQLString },
    url: { type: types.GraphQLString },
    title: { type: types.GraphQLString },
    num_comments: { type: types.GraphQLString },
    //preview: { type: RedditPreviewType },
  },
});

const Query = new types.GraphQLObjectType({
  name: 'Query',
  fields: function(){
    return {
      RedditType: {
        type: new types.GraphQLList(RedditType),
        resolve: function() {
          // return results from http request
          return axios.get('https://www.reddit.com/hot/.json?count=20', {
            headers: {
              'Content-Type': 'application/json'
            },
          }).then(function(res) {
            const docs = [];
            res.data.data.children.forEach(function(item) {
              docs.push(item.data);
            });
            return docs;
          });
        }
      }
    };
  },
});

/*
Creates a new instance of `GraphQLSchema` from GraphQL.js (http://graphql.org/graphql-js/type/#graphqlschema)
*/
const schema = new GraphQL.GraphQLSchema({
  query: Query,
});

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: global,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');