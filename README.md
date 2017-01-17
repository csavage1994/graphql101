# Starting to Think in GraphQL
This will be a no BS guide to understanding what GraphQL is and why it does what it does. I'm not going to show you how to set up webpack or babel (Hint: we're not going to use it here) or provide you with a starter kit that you don't understand half of. What I will do is give you a working barebones example and my thought process when using GraphQL in production. We're going to keep it simple here and stick with data retrieval. This repo also contains a similar example to what I'll walk through here, with more fields and nested objects. I'd recommend reading and following through this readme first, then check out what I have in my `app.js`. To run it, simply run `node app.js` and navigate to `localhost:4000/graphql`.

## What is GraphQL + why do I need it?
Think of GraphQL like it's Amazon, if you've ever ordered multiple items from Amazon at the same time from different sources, you'd know there's 2 options:

1. Select `Ship items seperately` with the knowledge that there's no guarantee that all the items will arrive at the same time and you have no clue how each of them will be packaged (We'll talk more about why this is imporant coming up)
2. Select `Ship items together`. In this case, Amazon is now handling the retrieval of each item and packaging them together before sending them out to you.

Starting to see how this can be used in terms of code? Good! If you see how something like this could be used in code in the real world you can probably skip the following example.

#### Example: How does this relate to your code?
Imagine this scenario, you're making a website that relies on information from both Reddit and Github. If you're not using GraphQL, what you'll most likely be doing is something like this:

1. Hit the reddit api, parse it once it comes back - 1 http request, 1 new method of parsing
2. Hit the Github api, parse it once it comes back - 1 http request, 1 new method of parsing
3. Perhaps combine the information to create more relavant information - 1 additional way of parsing the data

Looking at this, so far with only 2 sources of information, we're making 2 http requests and have 3 different ways of parsing our data. Let's look at how this would work with GraphQL

1. Hit your GraphQL api, GraphQL will then fetch all required information from all sources, and parse it once it comes back - 1 http request, 1 new method of parsing
2. ???

Since all of the information when using GraphQL comes back in a single object, you don't need multiple methods of parsing the information and you only need to make a single http request to retrieve information from the client side MAX. This is powerful not only in reducing the amount of requests your app makes, but it also saves a lot of headache when parsing and dealing with async stuff.

## Ready to Code?
Alright, enough with the boring stuff, let's see some of this actually working. What we're going to make is a GraphQL route that hits `https://www.reddit.com/hot/.json?count=25`, and pulls out the titles of the front page from Reddit. First, let's set up our environment. Inside of a clean directory run the following commands:

	npm init
    npm install --save axios graphql express-graphql
    touch app.js
    
Might as well jump right into it, open `app.js` in your favorite text editor and let's set up each of these

	const express = require('express');
    const graphqlHTTP = require('express-graphql');
    const GraphQL = require('graphql');
    const axios = require('axios');
    const types = require('graphql/type');

* `Express` will be used to serve our app
* `Axios` will be used to make our http requests
* `types` from `graphql` will allow us to declare new object types ( Pretty much let's us describe the shape of the data we're expecting )
* `GraphQL` is GraphQL, will be used to create our schema
* `graphqlHTTP` will be used to set up our graphql route which can be hit from the front end or by using graphiql, GraphQL's interactive playground

Let's take a quick break from the code and figure out what exactly we're looking for.

#### Breaking down the data
* For this section, I'll be using Postman for an easy way of making http requests to poke around the data

In order to start writing more code, we need to know what exactly we're looking for. Inside of Postman, let's check out the data.

1. In the input box, put `https://www.reddit.com/hot/.json?count=25`
2. To the left of the box, make sure the http verb is `GET`
3. Click `Send`

You should get a response that looks something like this: 

	{
    "kind": "Listing",
    "data": {
      "modhash": "",
      "children": [
        {
          "kind": "t3",
          "data": {
            "contest_mode": false,
            "banned_by": null,
            "domain": "x3.cdn03.imgwykop.pl",
            "subreddit": "space",
            "selftext_html": null,
            "selftext": "",
            "likes": null,
            "suggested_sort": null,
            "user_reports": [],
            "secure_media": null,
            "saved": false,
            "id": "5ohsrx",
            "gilded": 0,
            "secure_media_embed": {},
            "clicked": false,
            "report_reasons": null,
            "author": "Vatonee",
            "media": null,
            "name": "t3_5ohsrx",
            "score": 29621,
            "approved_by": null,
            "over_18": false,
            "removal_reason": null,
            "hidden": false,
            "preview": {
              "images": [
                {
                  "source": {
                    "url": "https://i.redditmedia.com/_3aLNUoioWq4qEa9BT-VCxCVITQ-3pLxy6pFVCUvZRY.jpg?s=36b790e5166b50efb25fe3d9b4918e3b",
                    "width": 900,
                    "height": 600
                  },
                  "resolutions": [
                    {
                      "url": "https://i.redditmedia.com/_3aLNUoioWq4qEa9BT-VCxCVITQ-3pLxy6pFVCUvZRY.jpg?fit=crop&amp;crop=faces%2Centropy&amp;arh=2&amp;w=108&amp;s=11879b3922a485e39ac545e05a361b5f",
                      "width": 108,
                      "height": 72
                    },
                    {
                      "url": "https://i.redditmedia.com/_3aLNUoioWq4qEa9BT-VCxCVITQ-3pLxy6pFVCUvZRY.jpg?fit=crop&amp;crop=faces%2Centropy&amp;arh=2&amp;w=216&amp;s=ce53aab40c86337767a8ee7d2e8518d1",
                      "width": 216,
                      "height": 144
                    },
                    {
                      "url": "https://i.redditmedia.com/_3aLNUoioWq4qEa9BT-VCxCVITQ-3pLxy6pFVCUvZRY.jpg?fit=crop&amp;crop=faces%2Centropy&amp;arh=2&amp;w=320&amp;s=323671341a1a204f9a395fb7a3f0ed8e",
                      "width": 320,
                      "height": 213
                    },
                    {
                      "url": "https://i.redditmedia.com/_3aLNUoioWq4qEa9BT-VCxCVITQ-3pLxy6pFVCUvZRY.jpg?fit=crop&amp;crop=faces%2Centropy&amp;arh=2&amp;w=640&amp;s=d1451a475f843fee7db5db4bcb7729dd",
                      "width": 640,
                      "height": 426
                    }
                  ],
                  "variants": {},
                  "id": "QEkSF5ro03Pzce5oMVMf38toiciezoZQLDdQD99bfA4"
                }
              ]
            },
            "thumbnail": "http://b.thumbs.redditmedia.com/CH_2klmuk4aOUynGtvLViAujweswQE03HSuehe1UFFo.jpg",
            "subreddit_id": "t5_2qh87",
            "edited": false,
            "link_flair_css_class": null,
            "author_flair_css_class": null,
            "downs": 0,
            "mod_reports": [],
            "archived": false,
            "media_embed": {},
            "post_hint": "image",
            "is_self": false,
            "hide_score": false,
            "spoiler": false,
            "permalink": "/r/space/comments/5ohsrx/spacex_landing_is_even_more_impressive_when_you/",
            "locked": false,
            "stickied": false,
            "created": 1484685113,
            "url": "http://x3.cdn03.imgwykop.pl/c3201142/comment_4WehOMrLe79UTxLYPQVm4ixdOJLHFdfH.jpg",
            "author_flair_text": null,
            "quarantine": false,
            "title": "SpaceX landing is even more impressive when you see the booster next to humans.",
            "created_utc": 1484656313,
            "link_flair_text": null,
            "distinguished": null,
            "num_comments": 1045,
            "visited": false,
            "num_reports": null,
            "ups": 29621
          }
        },
        More of these objects here...
        
Sweet! Take note that these objects are stored in `data.children`, we'll use this later. Looking through this, near the bottom we can see that there's a `title` field that contains the title of each post, since that's what we're looking for and we now know how the data is structured, let's get back to writing some code.

#### Code Onwards!

Now it's time to start declaring our `GraphQLObjectTypes`, in other words it's time to tell GraphQL about the structure of the data that we want. Inside of `app.js` below importing our requirements, let's create a simple `RedditType` for GraphQL:

	const RedditType = new types.GraphQLObjectType({
		
    });

Each new type must contain both a `name` and `fields` property, where `name` generally matches the name of the type (`RedditType` in this case) and `fields` is an object that contains the actual fields we want to pull from Reddit. Each of the properties inside of `fields` _MUST_ match the retrieved property name! Since the field we want is called `title`, our field name has to be `title` as well.

	const RedditType = new types.GraphQLObjectType({
    	name: 'RedditType',
        fields: {
        	title: { type: types.GraphQLString },
        },
    });
    
Each property inside of fields must also be an object with the key `type`, where the value is the GraphQL data type. You cannot use native types here (number, string, boolean), you must get them from our required `types`. There's every type you could want there, `Int`, `Float`, `Boolean` and `String` are the most common. Note that there's no `Object` field, I'll talk more about this at the end.

That's it for this object type! Let's move on to our `Query` data type. The difference between this and the `RedditType` is inside `Query`, we're going to tell GraphQL _where_ to get this information instead of how it should look. Start by defining a new object type again:

	const Query = new types.GraphQLObjectType({
    	name: 'Query',
    });
    
You'll notice that up until here it's exactly the same as our `RedditType`, however our `fields` property will need to be a function that returns an object. Each property of this object should match one of your declared data types. These should be the _highest_ level data types, as in you should have one for Reddit, one for Amazon, one for any other source you want to pull from. As a rule of thumb, for each http request you'd have to make, you should have one field here representing that source.

	const Query = new types.GraphQLObjectType({
    	name: 'Query',
        fields: function() {
        	return {
            	RedditType: {},
            };
        };
    });
    
Inside each of our properties of our returned object, we need 2 fields, `type`, which tells GraphQL how this data will look, and a new field `resolve`, which tells GraphQL how exactly to go about getting this data. Let's continue stepping through this to get a better picture

	const Query = new types.GraphQLObjectType({
    	name: 'Query',
        fields: function() {
        	return {
            	RedditType: {
                	type: new types.GraphQLList(RedditType),
                    resolve: // http request to get info
                },
            };
        };
    });
    
Inside the type, we're doing something new. `types.GraphQLList` is an array, so in essence, what this is saying to GraphQL is, "I want RedditType to return and array of the RedditTypes that we defined above". Since `RedditType` is an object that's expecting to have only a single property `title`, we should see as a response later on an array of objects with that single property. Let's move on to the resolve property, which is where we're going to make our http request and provide GraphQL with the needed information

	const Query = new types.GraphQLObjectType({
    	name: 'Query',
        fields: function() {
        	return {
            	RedditType: {
                	type: new types.GraphQLList(RedditType),
                    resolve: function() {
                      return axios.get('https://www.reddit.com/hot/.json?count=25', {
                          headers: { 'Content-Type': 'application/json' },
                      }).then(function(response) {
			                    const hits = [];
                          response.data.data.children.forEach(function(item){
                          	  hits.push(item);
                          });
                          return hits;
                      });
                    }
                },
            };
        };
    });
    
Remember when I said remember `data.children`? Axios returns an object that has a `data` field that contains the actual information from the http request, Reddit also contains a `data` field in their response, so to access what we actually want, we need to use `response.data.data.children`, which is the array of post objects that we want to pull from. Once we have access to that array, we can simply push each object to an array ( since we told GraphQL that we're expecting an array ), which is then returned to be the value of our `resolve` property.

We don't need to worry about pulling out the `title` field that we're looking for, a cool thing about GraphQL is that it does that for you when sending the information back!

If you've made it this far you're in the home stretch! Go take a walk, get a coffee, call your mom or whatever makes you happy, next we'll get into turning this query into a usable schema ( Hint: It's easy! )

#### Creating your Schema
Here we're going to define a new variable to hold our schema that our GraphQL route will use, it's pretty straight forward so let's get to it. Under your `Query` definition, let's add:

	const schema = new GraphQL.GraphQLSchema({
    	query: Query,
    });
    
And that's it! All this is doing is creating a new instance of `GraphQLSchema` from GraphQL, passing in our query as the structure for the data.

#### Set up app and GraphQL route

Last two steps, here's the code then we'll talk about the `/graphql` route that we're going to create. Add the following lines under your schema:

	const app = express();
    
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: global,
        graphiql: true,
    }));
    app.listen(4000);
    console.log('Running app on port 4000, visit localhost:4000/graphql to check it out!');
    
What this is saying is that if someone hits our `/graphql` route, we want GraphQL to take over, using the schema that we created. Setting `graphiql` to true let's us go to `localhost:4000/graphql` and view the GraphQL sandbox for testing queries against our schema, so let's try it out! Run `node app.js` then navigate to `localhost:4000/graphql`, you should be brought to a 2 paned screen. On the left hand side, try typing:

	{
	    RedditType {
        	title
        }    
    }
    
You should get something like this back

    {
      "data": {
        "RedditType": [
            {
              "title": "I wish I was as happy as this guy in traffic"
            },
            {
              "title": "TIL that scientists believe there is a 9th planet in our solar system that is roughly 10 times larger than earth. They haven't been able to locate it yet but they know it's there because of its gravitational effects on other objects."
            }
          ]
    }
    
If you get a response like this, you've made it! I'd recommend going back and seeing if you can modify `RedditType` to pull more fields. Try pulling out the `score` field, but be careful, it's stored as an integer instead of a string ( Hint: this should only be a 1 line change! ) If you want to get more advanced, try pulling information from a seperate source, you'll have to define a new data type, add it to our query, and create a new resolve function for retrieving the information, but this is where the real power in GraphQL lies.

Inside this repo, there's also a bit about how to deal with nested objects inside your response, I can write a snippet about this and also go into more detail about pulling from multiple sources and using GraphQL from the front end if there's any interest!