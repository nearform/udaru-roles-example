# Udaru Roles Example

This is an example of using Udaru's policy based access control (PBAC) features in a way that should be familiar to developers and administrators with knowledge of role based access control (RBAC).

## Quick Start

 - To start PostgreSQL: `docker-compose up -d`
 - To initialise PostgreSQL: `npm run pg:init`
 - To start the back end: `node server`
 - To create Udaru users, policies, etc.: `./create-policies`
 - To start the front end: `npm start`
 - Visit [http://localhost:3000](http://localhost:3000) in your browser!

## Udaru Configuration

This example uses four users and two teams.  First there is a special root user created when `npm run pg:init` is run.  This user has access to everything by default.

Another user is "Rachel Owner" who is the organization owner.  She has certain administrative privileges within Udaru, but does not have any policies that grant her access to the `/products` resource.  Rachel and the root user's accounts are used to authenticate API calls in [./create-policies](./create-policies).

🚨 Warning: in real code you would never authenticate from the front end to Udaru using the root user or organization owner.  They are included in the front end to illustrate how access control works for these users.

Finally, there are "Margaret Managerson" and "Sam Staffman".  Margaret is assigned to the managers team, while Sam is assigned to the staff team.  Members of the managers team are allowed to create and list products, while members of the staff team are allowed to list products only.

While PBAC allows for defining more nuanced access rules than RBAC, in this example Udaru teams are used analogously to RBAC roles.

To see the API calls used to initialize the Udaru policies for this example, along with comments, take a look inside the [./create-policies](./create-policies) script.

## Back End

The [back end](./server.js) is Hapi server.  The server hosts Udaru endpoints added with the Hapi plugin.  For this example, two additional endpoints have been added.  First, there is the `/products` endpoint.  It allows the `DELETE`, `GET`, `POST`, and `PUT` methods.  There is also a `/products/reverse` endpoint that allows `POST` requests.

To secure a route with Udaru, the route code itself does not need to incorporate knowledge of how the system will authorize requests.  Instead, configuration values are added that define what action and resource should be checked against the policies for the user authenticated for that request.

Take, for example, the `GET /products` endpoint.  *The resource and action names used here were defined in [./create-policies](./create-policies).*

```javascript
UdaruServer.route({
  method: 'GET',
  path: '/products',
  handler: (request, reply) => reply(products),
  config: {
    plugins: {
      auth: {
        action: 'org1:action:list',
        resource: '/products'
      }
    }
  }
})
```

## Front End

This example uses a React app for the [front end](./src/App.js).  Five buttons are displayed.  If the user is allowed to use the action on the resource associated with a button, that button will be displayed in green.  If the user does not have access, the button will be displayed in red.

Clicking the button will attempt to perform the given action on the `/products` resource.  If the user has permission, the action will succeed.  If not, an error from the back end will be displayed that gives some detail of why the request failed.

The batch access endpoint is used to check a number of permissions for a user in one request.  For example, this `GET` request to the batch access endpoint is used in the front end's `changeUser` function:

```javascript
const resources = await fetchJSON(`/authorization/access/${userId}`, {
  body: JSON.stringify({
    resourceBatch: [
      { action: 'org1:action:create', resource: '/products' },
      { action: 'org1:action:list', resource: '/products' },
      { action: 'org1:action:delete', resource: '/products' },
      { action: 'org1:action:append', resource: '/products' },
      { action: 'org1:action:reverse', resource: '/products' }
    ]
  }),
  headers: { Authorization: userId },
  method: 'POST'
})
```

## Clean Up

Simply kill the front end and back end processes, then run `docker-compose down` to stop PostgreSQL and delete its container and related storage.
