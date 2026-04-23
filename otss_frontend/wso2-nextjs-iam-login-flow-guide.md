# Next.js Complete Guide



---
## Section: Introduction


Next.js is a popular React framework that enables developers to build fast, scalable web applications with **Server-Side Rendering(SSR)** and **Static Site Generation(SSG)**. It allows for more efficient routing, performance optimization, and simplified deployment. By using reusable components and the built-in API routes, Next.js simplify the process of creating dynamic, user-driven web apps.

Implementing user login in your Next.js app is essential for managing access, personalizing user experiences, and securing the application. It helps improve user interaction, protects user data, boosts engagement, and ensures compliance with industry regulations.

### Learning objectives

This guide will walk you through everything you need to know about securing Next.js apps, including implementing user login in your Next.js app, integrating it with an Identity Provider (IdP) to make the login process simple and secure, and general guidelines to protect your end users. It also covers how to make secure API calls to an OAuth2-protected API within your Next.js app.

In this guide, you will:

* Register an application in {{product_name}}
* Create a Next.js app
* Install Asgardeo SDK
* Add login and logout  to your app
* Display logged in user detail
* Securing routes within the app
* Accessing protected API from your Next.js app
* Managing tokens in your Next.js app

!!! tip "Tip"

    This guide takes approximately 60 minutes to complete and covers everything required to add user login and secure your Next.js apps. If you’re looking for a shorter guide, try the [Next.js Quick Start guide]({{ base_path }}/quick-starts/nextjs/){:target="_blank"}, which takes around 15 minutes to complete.



---
## Section: Prerequisite

### Before you start, ensure you have the following

* About 60 minutes
* WSO2 Identity Server [setup](https://is.docs.wso2.com/en/latest/get-started/quick-set-up/){:target="_blank"}
* [Node.js](https://nodejs.org/en/download/package-manager){:target="_blank"} v20+ and npm
* A favorite text editor or IDE



!!! note "Note"

    You need to have installed [Node.js](https://nodejs.org/en/download/package-manager){:target="_blank"} v18+ and npm (which comes inbuilt with Node) to run this sample. Although Node.js is primarily a server-side language,it needs to have been installed to manage dependencies and run scripts for our project.




---
## Section: Register an application

First unless you already have done that, you need to register your application as a Traditional Web Application.

* Download and [setup WSO2 Identity Server](https://is.docs.wso2.com/en/latest/get-started/quick-set-up/){:target="_blank"}
* Sign into {{product_name}} console and navigate to **Applications > New Application.**
* Select **Traditional Web Application** (*Make sure that the protocol remains set to OpenID Connect (OIDC)*)

![Select Traditional Page Application]({{base_path}}/assets/img/complete-guides/nextjs/image1.png){: width="600" style="display: block; margin: 0;"}  
  
Next, complete the wizard popup by providing a suitable name and an authorized redirect URL.

!!! Example
    name: {{product}}-nextjs

    Authorized redirect URL: http://localhost:3000

![Register a new application]({{base_path}}/assets/img/complete-guides/nextjs/image2.png){: width="600" style="display: block; margin: 0;"}

!!! Info

    The authorized redirect URL determines where Asgardeo should send users after they successfully log in. Typically, this will be the web address where your application is hosted. For this guide, we'll use http://localhost:3000, as the sample application will be accessible at this URL

Make a note of the following values from the **Protocol** and **Info** tabs of the registered application. You will need them to configure the Asgardeo provider.

* **`client-id`** from the **Protocol** tab.
* **`client-secret`** from the **Protocol** tab.
* **`issuer`** from from the **Info** tab.


In this step, we have registered our Next.js app as an application in the {{product_name}} console and generated the required metadata. Next, we will create a Next.js app.



---
## Section: Create a Next.js app


For this guide, we will walk you through setting up a simple Next.js application.

Open a terminal, change directory to where you want to initialize the project, and run the following command to create your first Next.js sample app.

Running the above command will generate a new folder named {{ product }}-nextjs, containing a ready-to-use Next.js project set up with TypeScript. The project includes a development server that automatically reloads the app whenever changes are made.

=== "npm"

    ``` bash
    npm create next-app@latest {{ product }}-nextjs -- --yes
    ```

=== "yarn"

    ``` bash
    yarn create next-app@latest {{ product }}-nextjs -- --yes
    ```

=== "pnpm"

    ``` bash
    pnpm create next-app@latest {{ product }}-nextjs -- --yes
    ```

Once this command is executed, if everything goes smoothly, your terminal output should resemble the following.

![Create Next.js app]({{base_path}}/assets/img/complete-guides/nextjs/image3.png){: width="800" style="display: block; margin: 0;"}

Once the application is created, navigate to the app folder. Then run the sample in the development mode. This allows you to see real-time updates and debug the app as you make changes.

=== "npm"

    ``` bash
    cd {{ product }}-nextjs
    npm run dev
    ```

=== "yarn"

    ``` bash
    cd {{ product }}-nextjs
    yarn dev
    ```

=== "pnpm"

    ``` bash
    cd {{ product }}-nextjs
    pnpm dev
    ```

This will start the Next.js development server, typically at [http://localhost:3000](http://localhost:3000){:target="_blank"}, and you should see the default Next.js starter page. Confirm that everything is set up correctly by checking for the terminal output indicating that the server is running.

![Navigate to localhost]({{base_path}}/assets/img/complete-guides/nextjs/image4.png){: width="800" style="display: block; margin: 0;"}

At this point, you have a simple yet fully functional Next.js app. Now, it's time to integrate user authentication within the application. For this guide, we will be using the auth.js library, which provides a simple and secure way to handle authentication in Next.js apps.  



---
## Section: Configure Asgardeo SDK


### Install `@asgardeo/nextjs`

Asgardeo Next.js SDK provides all the components and hooks you need to integrate {{ product_name }} into your app. To get started, simply add the Asgardeo Next.js SDK to the project. Make sure to stop the dev server started in the previous step.

=== "npm"

    ``` bash
    npm install @asgardeo/nextjs
    ```

=== "yarn"

    ``` bash
    yarn add @asgardeo/nextjs
    ```

=== "pnpm"

    ``` bash
    pnpm add @asgardeo/nextjs
    ```

### Set up environment variables

Create a `.env` or an appropriate environment configuration file in the root of your Next.js project. This file will store all the configuration values required for the Asgardeo Next.js SDK to function properly.

```bash title=".env"
NEXT_PUBLIC_ASGARDEO_BASE_URL="{{content.sdkconfig.baseUrl}}"
NEXT_PUBLIC_ASGARDEO_CLIENT_ID="<your-app-client-id>"
ASGARDEO_CLIENT_SECRET="<your-app-client-secret>"
```

!!! danger "Warning"

    There is a Secret used for signing JWT session cookies. If this is not defined, it will use the default one configured in the Asgardeo SDK. However it is mandatory to change this in a production environment.

    Please generate a random key with the following.

    ```bash
    openssl rand -base64 32
    ```
    Add it to the .env file as below.
    
    ```bash
    ASGARDEO_SECRET="<your-secret-key-for-jwt-signing>"
    ```

### Setup the middleware

Create a file called `middleware.ts` in the root of your Next.js project and integrate the `asgardeoMiddleware` from the Asgardeo Next.js SDK.

The `asgardeoMiddleware` helper integrates Asgardeo authentication into your Next.js application and supports both the App and Pages routers.

```bash title="middleware.ts"
import {asgardeoMiddleware} from '@asgardeo/nextjs/server';

export default asgardeoMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Add `<AsgardeoProvider />` to your app

The `<AsgardeoProvider />` serves as a context provider for the SDK. You can integrate this provider to your app by wrapping the root component.

Add the following changes to the `app/layout.tsx` file in your Next.js project.

```javascript title="app/layout.tsx" hl_lines="3 31"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {AsgardeoProvider} from '@asgardeo/nextjs/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AsgardeoProvider>{children}</AsgardeoProvider>
      </body>
    </html>
  );
}
```

Now we have successfully configured the Asgardeo SDK to be used in the Next JS application.



---
## Section: Add login and logout


Asgardeo SDK provides `SignInButton`, `SignOutButton` components to handle user sign-in and sign-out. You can use these components along side `SignedIn` and `SignedOut` components to conditionally render content based on the user's logged in state.

Replace the existing content of the `app/page.tsx` file with following content.

```javascript title="app/page.tsx"  hl_lines="1 7-12"
import {SignInButton, SignedIn, SignOutButton, SignedOut} from '@asgardeo/nextjs';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <header className="flex flex-col items-center gap-2">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <SignOutButton />
        </SignedIn>
      </header>
    </div>

  );
}
```

This code snippet adds a login button in the application that triggers the signIn function from @asgardeo/nextjs when the user clicks the "Sign in" button. The button uses an asynchronous action to securely initiate the login process with {{product_name}}. When the user clicks the button, the app redirects them to the {{product_name}} login page, and once logged in, they are returned to the app with their session established.

Save the changes and re-run the application in development mode if it is not running already.

```bash
npm run dev
```

Once the application is started, you will see the homepage of the application with the changes we made.

![Login screen]({{base_path}}/assets/img/complete-guides/nextjs/image5.png){: width="800" style="display: block; margin: 0;"}

### Initiate Sign In

Clicking on the login button will initiate an OIDC request. You will be able to observe the authorize request in the browser devtools as follows. To see this, right click on the application and click inspect and switch to the network tab. In the filter input, type “authorize”, and click on the sign in button.

![OIDC request]({{base_path}}/assets/img/complete-guides/nextjs/image6.png){: width="800" style="display: block; margin: 0;"}

!!! tip "Tip"

    The OpenID Connect specification offers several functions, known as grant types, to obtain an access token in exchange for user credentials. This example uses the authorization code grant type. In this process, the app first requests a unique code from the authentication server, which can later be used to obtain an access token. 
    
{{product_name}} will receive this authorization request and respond by redirecting the user to a login page to enter their credentials.

At this stage, you should have already created a test user in {{product_name}}, as outlined in the [prerequisite]({{ base_path }}/complete-guides/nextjs/prerequisite) section. Now can enter the username and password of the test user to the login screen.



---
## Section: Display user details

<!-- 
At this point, we’ve successfully implemented login and logout capabilities using the Asgardeo SDK. The next step is to explore how to access and display logged-in user details within the app utilizing the callbacks provided by auth.js library. To retrieve user information from the ID token provided by {{product_name}}, the simplest approach is to use the JWT (JSON Web Token) returned during authentication. In auth.js, you can leverage the JWT callback function to access and manipulate this token. The JWT callback is triggered whenever a JWT is created or updated (e.g., at sign-in), making it a great place to include the user's information

Modified the code as below to see logged in user details.

```javascript title="auth.ts" hl_lines="14-29"

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

declare module "next-auth" {
  interface User {
    username?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username;
      }

      return token;
    },
    async session({ session, token }) {            
      if (token) {
        session.user.username = token.username as string;
      }

      return session;
    }
  }
})

```
Auth.js is made to work with many identity providers and some of the objects/arguments are not valid or vary from one provider to another. In {{product_name}}, by accessing the `profile` object in the `jwt` callback, we are able to get the information about the user using their decoded ID token information that is received from the profile object. 

Once this user information is returned from the `jwt` callback, we need to pass this data to the `session` object of the `auth()` function. To do that, we will be using the `session` callback. In the `session` callback, `session` is the object that is available in the `auth()` function and `token` object is the object returned from the `jwt` callback.

Then, update `page.tsx` with the following highlighted line to display the username of logged in user.  

```javascript title="page.tsx" hl_lines="4"

...
          <>
            <p> You are now signed in!</p>
            <p> hello {session.user?.username}</p>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button type="submit">Sign Out</button>
            </form>
          </>

...

```

If your Next.js application is already running in the development mode, the home page will be reloaded and you will see the updated user interface.

![Logout screen]({{base_path}}/assets/img/complete-guides/nextjs/image8.png){: width="800" style="display: block; margin: 0;"}

### Getting additional user attributes

By default, {{product_name}} will only send the username in the ID token. But this can be configured in the {{product_name}} console to send any user attribute in the ID token and then that will be available in the profile object.

To get additional user attributes to the ID token, the application should be configured to request the specific user attributes at the time of login. For example, if you want to retrieve a user's mobile number as an attribute, you need to configure the application to request the user’s mobile number as an attribute in the ID token.

1. Log in to the {{product_name}} console and select the application you created.
2. Go to the **User Attributes** tab, expand **Profile** section. 
3. Select the **First Name (given_name)**.
4. Select the **Last Name (family_name))**.
5. Click Update to save the changes.

Now, you need to modify the `auth.ts` with the required user attributes as shown in the following example.  

```javascript title="auth.ts" hl_lines="7-8 20-21 29-30"

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

declare module "next-auth" {
  interface User {
    username?: string;
    given_name?: string;
    family_name?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username;
        token.given_name = profile.given_name;
        token.family_name = profile.family_name;
      }

      return token;
    },
    async session({ session, token }) {            
      if (token) {
        session.user.username = token.username as string;
        session.user.given_name = token.given_name as string;
        session.user.family_name = token.family_name as string;
      }

      return session;
    }
  }
})

```

Since we are adding new information to the user object inside the `session object` (which is having the interface - User), note that we also have to update the interface to contain this new information.

Then, you can update `page.tsx` as given below to display the above user attributes.  

```javascript title="page.tsx" hl_lines="5-6"

...
          <>
            <p> You are now signed in!</p>
            <p> hello {session.user?.username}</p>
            <p> Given name:  {session.user?.given_name}</p>
            <p> Family name: {session.user?.family_name}</p>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button type="submit">Sign Out</button>
            </form>
          </>

...

```

!!! Tip

    If you don’t get any value for given_name and family_name, it might be because you have not added these values when creating the user in {{product_name}}. You can add these values either using the **{{product_name}} console** or logging into the **My Account** of that particular user.

### Displaying user details in the server side

Using the above information from the `session` object. Let's create a `ServerProfile` server component to display the user details. To do this, create a file `/src/app/server-profile/page.tsx` as follows.

```javascript title="/src/app/server-profile/page.tsx"
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { redirect } from "next/navigation";

const ServerProfile = async () => {
    const session = await auth();

    const goToIndex = async () => {
        "use server";
        redirect("/");
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="mb-5">Profile Page</h1>
            <p>Email: {session?.user?.email}</p>
            <p>First Name: {session?.user?.given_name}</p>
            <p>Last Name: {session?.user?.family_name}</p>
            <form action={goToIndex}>
                <button
                    type="submit"
                    className="rounded-full border border-solid flex items-center justify-center text-sm h-10 px-4 mt-3"
                >
                    Go to index page
                </button>
            </form>
            <div className="mt-5">
                <SignOutButton />
            </div>
        </div>
    );
};

export default ServerProfile;
```

This component is fully server-side rendered and will fetch the user details from the {{product_name}}. The `fetchUserDetails` function is used to fetch the user details from the {{product_name}} using the access token. The `ServerProfile` component will display the user details if the user is logged in. If the user is not logged in, the component will display an error message.

When a user is logged in and if your visit **http://localhost:3000/server-profile**, the following content should be visible:

![Profile screen (server component)]({{base_path}}/assets/img/complete-guides/nextjs/image23.png){: width="800" style="display: block; margin: 0;"}

### Displaying user details in the client side

In previous steps we used session data and retrieved current user information using the session object in the `auth()` function provided by the Auth.js library. What if we wanted to do the same in the client-side? As we can have both client and server components in Next.js, it is important to have both as we want to secure both components using authentication with Next.js and {{product_name}}.

The approach is very similar to server-side components. To demonstrate this, let’s create a user profile component in our application. To get session information in the client-side, you can use the `useSession()` hook offered by Auth.js. Now using this hook, let's create a file `/src/app/client-profile/page.tsx` as follows.

```javascript title="/src/app/client-profile/page.tsx"
"use client";

import { SignOutButton } from "@/components/sign-out-button";
import { useSession } from "next-auth/react";

export default function Profile() {
    const { data: session } = useSession()

    if (!session) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <h1>You need to sign in to view this page</h1>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="mb-5">Profile Page</h1>
            <p>Email : {session?.user?.email}</p>
            <p>First Name : {session?.user?.given_name}</p>
            <p>Last Name : {session?.user?.family_name}</p>
            <div className="mt-5">
                <SignOutButton />
            </div>
        </div>
    );
}

```

Since we are accessing the hooks provided by the Auth.js, it is important to wrap the whole application using the `<SessionProvider/>` provider. This can be achieved by wrapping the `/src/app/layout.tsx` file as it is the entry point of the application.

```javascript title="/src/app/profile/page.tsx" hl_lines="14-16"
import { SessionProvider } from "next-auth/react";

...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

```

!!! note
    This a good time to remove the `<SessionProvider/>` we added to the `/src/app/page.tsx` in previous steps as this is no longer required.

When a user is logged in and if your visit http://localhost:3000/client-profile, the following content should be visible:

![Profile screen (client component)]({{base_path}}/assets/img/complete-guides/nextjs/image21.png){: width="800" style="display: block; margin: 0;"}

When a user is not logged in, it should look as follows:

![Profile screen (Not logged in)]({{base_path}}/assets/img/complete-guides/nextjs/image22.png){: width="800" style="display: block; margin: 0;"}

In this step, we further improved our Next.js app to display the user attributes. As the next step, we will try to secure routes within the app. -->

At this point, we’ve successfully implemented login and logout capabilities using the Asgardeo  SDK. The next step is to explore how to access and display logged-in user details within the app.

The Next SDK has components can be used to display user information. You can use the `User`, `UserProfile`, or `UserDropdown` components to access and display user profile information in a declarative way.

- `User`: The `User` component provides a render prop pattern to access user profile information:
- `UserProfile`: The `UserProfile` component provides a declarative way to display and update user profile information.
- `UserDropdown`: The `UserDropdown` component provides a dropdown menu with built-in user information and sign-out functionality.

First let's use the `User` Component to display the username as below.

```javascript title="app/page.tsx" hl_lines="1 17-27"
'use client'

import { SignedIn, SignedOut, SignInButton, SignOutButton, User } from '@asgardeo/nextjs';

export default function Home() {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <header className="flex flex-col items-center gap-2">
        <SignedIn>
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </header>
      <main className="flex flex-col items-center gap-4">
        <SignedIn>
          <User>
            {(user) => (
              <div>
                <p>Welcome back, {user.userName || user.username || user.sub}</p>
              </div>
            )}
          </User>
        </SignedIn>
      </main>
      </div>
    </>
  );
}
```

Now let's use the `UserProfile` component to display and update user profile information.

```javascript title="app/page.tsx" hl_lines="1 26"
'use client'

import { SignedIn, SignedOut, SignInButton, SignOutButton, User, UserProfile } from '@asgardeo/nextjs';

export default function Home() {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <header className="flex flex-col items-center gap-2">
        <SignedIn>
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </header>
      <main className="flex flex-col items-center gap-4">
        <SignedIn>
          <User>
            {(user) => (
              <div>
                <p>Welcome back, {user.userName || user.username || user.sub}</p>
              </div>
            )}
          </User>
          <UserProfile />
        </SignedIn>
      </main>
      </div>
    </>
  );
}
```

Finally we can use the `UserDropdown` component to provide a dropdown menu with built-in user information and sign-out functionality.

```javascript title="app/page.tsx" hl_lines="1 11"
'use client'

import { SignedIn, SignedOut, SignInButton, SignOutButton, User, UserDropdown, UserProfile } from '@asgardeo/nextjs';

export default function Home() {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <header className="flex flex-col items-center gap-2">
        <SignedIn>
          <UserDropdown />
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </header>
      <main className="flex flex-col items-center gap-4">
        <SignedIn>
          <User>
            {(user) => (
              <div>
                <p>Welcome back, {user.userName || user.username || user.sub}</p>
              </div>
            )}
          </User>
          <UserProfile />
        </SignedIn>
      </main>
      </div>
    </>
  );
}
```

If your Next application is already running in the development mode, the home page will be reloaded and you will see the updated user interface.

![Logout screen]({{base_path}}/assets/img/complete-guides/nextjs/image25.png){: width="800" style="display: block; margin: 0;"}

In this step, we further improved our React app to display the user attributes. As the next step, we will try to secure routes within the app.



---
## Section: Securing Routes

<!-- 
The `<Profile/>` components (server-side and client-side) we developed in the previous step should only be accessible when a user is already logged in. Because if a valid user is not in the session, there is no point of showing an empty profile page. Therefore we need to secure the routes: **http://localhost:3000/client-profile** and **http://localhost:3000/server-profile**. In this example, we will be demonstrating how to secure a route using Auth.js in both server-side and client-side.

### Securing the Server-Side Components

Here we will be securing the server-side components

#### Update middleware to secure the server-side route

Recall that we created a  `middleware.ts` file in the root of the `src` directory when configuring Auth.js? We will now update this file with the following configuration to securet the `/server-profile` route as follows.

```javascript title="src/middleware.ts" hl_lines="4"
export { auth as middleware } from "@/auth"

export const config = {
    matcher: ["/server-profile"]
};
```

By defining a `matcher` configuration, we can control which routes trigger the middleware. For example, with a matcher set to ["/server-profile"], the middleware only runs for requests to **/server-profile**. This approach centralizes authentication logic while keeping other routes unaffected.

#### Handle redirection using callbacks

Using the `authorized` callback in Auth.js, we can ensure that only authenticated users can access protected routes.

```javascript title="src/auth.ts"
...
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...
  callbacks: {
    ...
    authorized: async ({ request, auth }) => {
      // Logged in users are authenticated, otherwise redirect to index page
      if (!auth) {
        return Response.redirect(new URL("/", request.nextUrl))
      }
      
      return !!auth
    },
  }
})
```

This callback checks the auth parameter, which holds the user's authentication data. If the user is not authenticated (auth is null or undefined), they are redirected to the login page (/) using `Response.redirect()`. For authenticated users, the function returns true, allowing access.

Now verify that you cannot access http://localhost:3000/server-profile URL when you are not logged in. You will be redirected to http://localhost:3000 if you do not have a valid user logged in.

### Securing the Client-Side Components

Here we will be securing the client-side components

#### Create a Higher-Order Component (HOC) - withProtectedRoute

A higher-order component in React is a function that takes a component and returns a new component (with additional functionality). The HOC `withProtectedRoute` will check if a user is authenticated and either render the component or redirect the user to the login page.

This can be achieved by using the status object in the `useSession()` hook provided by Auth.js. The status object can have three values depending on the authenticated state.

- **authenticated** - User is authenticated and contains a valid session
- **unauthenticated** - User is NOT authenticated and does not have a valid session
- **loading** - Auth.js is still processing the request and is in an intermediate loading state. This useful to show proper loading screens in the UI and avoid inconsistencies.

Depending on these states, let’s create the `withProtectedRoute` using the following code:

```javascript title="components/with-protected-component.tsx"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const withProtectedRoute = (WrappedComponent: React.ComponentType) => {

  const ComponentWithAuth = (props: React.ComponentProps<typeof WrappedComponent>) => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {        
      // If there is no session, redirect to the index page
      if (status === "unauthenticated") {
        router.push('/');
      }
    }, [router, status]);

    if (status === "loading") {
      return <p>Loading...</p>;
    }

    // If the user is authenticated, render the WrappedComponent
    // Otherwise, render null while the redirection is in progress
    return status === "authenticated" ? <WrappedComponent {...props} /> : null;
  };

  return ComponentWithAuth;
};

```

The HOC-withProtectedRoute first checks if the user is authenticated, unauthenticated, or still in a loading state. If the status is `unauthenticated`, meaning the user does not have a valid session, the HOC uses the `useRouter` hook from Next.js to programmatically redirect the user to the home page (or any other page you specify). This ensures that users who are not logged in cannot access protected content.

While auth.js is still determining the user's status, the component shows a simple loading message (Loading...) to prevent the protected component from being rendered prematurely. Once the status is confirmed as authenticated, meaning the user is successfully logged in and has a valid session, the HOC renders the wrapped component and passes any props to it as intended. If the user is not authenticated, the component does not render, and the redirection takes place smoothly.

This approach allows you to manage authentication checks and redirection in one place, simplifying the process of protecting multiple components across your app. By using this HOC, you can easily control access to pages, ensuring that sensitive content is only available to logged-in users while keeping the rest of the app running seamlessly.

It can be applied to the Profile component as follows:

```javascript title="app/profile/page.tsx"

"use client";

import { SignOutButton } from "@/components/sign-out-button";
import { withProtectedRoute } from "@/components/with-protected-route";
import { useSession } from "next-auth/react";

const Profile = () => {
    const { data: session } = useSession()

    if (!session) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <h1>You need to sign in to view this page</h1>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="mb-5">Profile Page</h1>
            <p>Email : {session?.user?.email}</p>
            <p>First Name : {session?.user?.given_name}</p>
            <p>Last Name : {session?.user?.family_name}</p>
            <div className="mt-5">
                <SignOutButton />
            </div>
        </div>
    );
}

export default withProtectedRoute(Profile);

```

Now verify that you cannot access http://localhost:3000/client-profile URL when you are not logged in. You will be redirected to http://localhost:3000 if you do not have a valid user logged in.

In this step, we looked into how to secure component routes within a Next.js app. Next, we will try to access a protected API from our Next.js app, which is a common requirement. -->

Using the Next Asgardeo SDK you can also secure routes. For example if you have a page you need to show only when the user is logged in, you can follow the below steps.

Add the following to the middleware.ts file

```javascript title="middleware.ts"
import {asgardeoMiddleware, createRouteMatcher} from '@asgardeo/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard',
  '/dashboard/(.*)',
]);

export default asgardeoMiddleware(async (asgardeo, req) => {
  if (isProtectedRoute(req)) {
    const protectionResult = await asgardeo.protectRoute();

    if (protectionResult) {
      return protectionResult;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

Here you need to create the relevant `/dashboard` page in your app accordingly.

Now verify that you cannot access `http://localhost:3000/dashboard` URL when you are not logged in. You will be redirected to `http://localhost:3000` if you do not have a valid user logged in.

In this step, we looked into how to secure component routes within a Next.js app. Next, we will try to access a protected API from our Next.js app, which is a common requirement.



---
## Section: Accessing protected API


In this section, we will focus on how to call a secure API from your Next.js app.

We’ve already covered the key steps for adding user login and managing authentication in your Next.js app.
Moving on to accessing protected APIs, an access token is typically used when your application needs to interact with a secure backend API. This token contains the necessary permissions (or "scopes") for making API requests on behalf of the authenticated user. In this section, we’ll explore how to use this token to make authenticated API calls from your Next.js app.

For simplicity, let's assume that the APIs you're calling are secured by the same Identity Provider (IdP) and share the same issuer. This setup is common when your Next.js app is interacting with internal APIs that belong to the same organization. However, if your app needs to call APIs secured by a different IdP, you’ll need to exchange your current access token for a new one issued by the IdP securing those APIs. This can be done using the OAuth2 token exchange grant type or other supported grant types. We will cover these scenarios in a separate guide.

### Access scim2/Me endpoint

In {{product_name}}, `scim2/` REST API implements the SCIM 2.0 Protocol according to the [SCIM 2.0 specification](https://datatracker.ietf.org/doc/html/rfc7644). The scim2/Me endpoint will return the user details of the currently authenticated user. To access this endpoint, we’ll define this endpoint in our .env file as follows.

```bash title=".env"
NEXT_PUBLIC_AUTH_ASGARDEO_ME_ENDPOINT="{{content.sdkconfig.baseUrl}}/scim2/Me"
```

Use the following snippet to access the scim2/Me endpoint.

```javascript
'use server';

import { asgardeo } from "@asgardeo/nextjs/server";
import { SignOutButton } from "@asgardeo/nextjs";
import { redirect } from "next/navigation";

interface UserDetails {
    emails: string[];
    name: {
        givenName: string;
        familyName: string;
    };
}

export const goToHome = async () => {
    "use server";
    redirect("/");
};

const fetchUserDetails = async (accessToken: string): Promise<UserDetails> => {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ME_ENDPOINT as string, {
            method: "GET",
            headers: {
                Accept: "application/scim+json",
                "Content-Type": "application/scim+json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch protected data");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching protected data:", error);
        throw error;
    }
};

const ServerProfile = async () => {
    const client = await asgardeo();
    const sessionId = await client.getSessionId();
    const accessToken = await client.getAccessToken(sessionId as string);

    if (!sessionId || !accessToken) {
        return;
    }

    let userDetails: UserDetails;

    try {
        userDetails = await fetchUserDetails(accessToken);
    } catch {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <h1>Failed to fetch user details</h1>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="mb-5">Profile Page</h1>
            <p>Email: {userDetails.emails?.[0]}</p>
            <p>First Name: {userDetails.name?.givenName}</p>
            <p>Last Name: {userDetails.name?.familyName}</p>
            <form action={goToHome}>
                <button
                    type="submit"
                    className="rounded-full border border-solid flex items-center justify-center text-sm h-10 px-4 mt-3"
                >
                    Go to Home page
                </button>
            </form>
            <div className="mt-5">
                <SignOutButton />
            </div>
        </div>
    );
};

export default ServerProfile;

```

By following the above steps we can access protected APIs.



---
## Section: Manage tokens in Next.js


### Token Validation

A key principle of security tokens is that the receiver must first validate the token. This involves checking the authenticity of the token issuer, ensuring the token meets validity criteria such as expiration time, and confirming that the receiver is authorized to use the token. The Asgardeo SDK handles token validation automatically as part of its authentication and session management process to ensure that users have valid and unexpired tokens when accessing protected resources.

When a user signs in, the Asgardeo  SDK acquires an access token (and often an ID token) from {{product_name}}. The access token is by default an opaque token and the ID token is in the form of JSON Web Tokens (JWTs). The SDK automatically validates the token when it is obtained. This involves several checks:

- **Signature Validation:** The SDK verifies the JWT's signature using the public key retrieved from {{product_name}} JWKS endpoint. This ensures that the token has been issued by a trusted authority and has not been tampered with.

- **Expiration Check:** The SDK checks the `exp` (expiration) claim in the token to ensure it has not expired. Tokens are time-bound, and once the expiration time is reached, the token is considered invalid.

- **Issuer Validation:** The SDK verifies that the `iss` (issuer) claim in the token matches the expected issuer URL, which is typically the base URL specified in the .env file.

- **Audience Validation:** The SDK checks the aud (audience) claim to ensure the token is intended for your application (identified by the `clientID` in your .env file).

### Token Persistence

In the Asgardeo SDK, by default, an in memory token storage is used to store access tokens.

### Initiate Logout

The Asgardeo SDK provides a simple approach  to handle user logout from your app. When a user logs out, the SDK ensures that both the local session and the session on the {{product_name}} are terminated, ensuring a complete and secure logout process and you don’t need to worry on cleanup activities

When a user initiates log out, the following steps typically occur.

- **Local Session Termination:** The SDK clears any locally stored credentials, such as the access token and the ID token, which are used to maintain the user's authentication state within the application. This effectively logs the user out of the application locally.

- **Redirection to {{product_name}} for sign out:** After clearing the local session, the SDK redirects the user to the sign-out endpoint of your {{product_name}} organization. This ensures that the user is also signed out globally from {{product_name}}. It’s particularly important in single sign-on (SSO) scenarios where the user might be logged into multiple applications under the same identity.

- **Post Sign-Out Redirection:** Once the global sign-out is complete, the user is redirected back to a specified URL, usually the application's homepage or a custom logout page, which is configured in the SDK's authConfig under signOutRedirectURL.



---
## Section: Next Steps


Now that your Next application is secured with authentication features integrated, It is time to explore the additional features {{product_name}} offers to make the login flow more diverse and secure.

- [Multi factor authentication]({{ base_path }}/guides/authentication/mfa/){:target="_blank"}
- [Passwordless authentication]({{ base_path }}/guides/authentication/passwordless-login/){:target="_blank"}
{% if product_name == 'Asgardeo' %}
- [Self registration]({{ base_path }}/guides/user-accounts/configure-self-registration/){:target="_blank"}
{% else %}
- [Self registration]({{ base_path }}/guides/account-configurations/user-onboarding/self-registration/){:target="_blank"}
{% endif %}
- [Login UI customization]({{ base_path }}/guides/branding/){:target="_blank"}



---
## Section: Introduction


In modern web applications, seamless authentication is a critical factor in delivering a smooth user experience. Traditional authentication methods often require users to be redirected to an external browser, which can disrupt the flow of an application. App-native authentication solves this by enabling authentication within the application's environment, eliminating unnecessary redirects and ensuring users remain engaged within the app.

This guide will walk you through integrating app-native authentication with {{product_name}} in a Next.js application. Next.js, a powerful React framework, offers features such as Server-Side Rendering (SSR), Static Site Generation (SSG), and API routes, making it an ideal choice for building scalable, high-performance applications. By leveraging Next.js's capabilities and {{product_name}}'s authentication mechanisms, we can implement a secure, seamless login system that enhances user experience and ensures compliance with industry standards.

Whether you're looking to improve user engagement, protect sensitive data, or simplify authentication workflows, this guide will provide step-by-step instructions to help you integrate {{product_name}}'s app-native authentication into your Next.js application efficiently.

#### Learning objectives

This guide will provide you with a comprehensive understanding of how to implement app-native authentication in a Next.js application using {{product_name}}. You will learn how to integrate authentication seamlessly within your application, ensuring a secure and smooth login experience without external browser redirection. Additionally, you will gain insights into securing API calls, managing authentication tokens, and protecting user data.

By the end of this guide, you will be able to:

- Register an application in {{product_name}} to enable authentication.
- Set up a Next.js application with authentication capabilities.
- Install and configure the Asgardeo SDK, enabling seamless authentication.
- Implement login and logout functionality to allow users to authenticate within the app using app native authentication.
- Retrieve and display user details after a successful login.
- Add Multi Factor Authentication with app native authentication
- Add Social Login with app native authentication
- Manage authentication tokens effectively within the application to maintain session security.

By following this step-by-step guide, you will be equipped to integrate {{product_name}} app-native authentication into your Next.js app, ensuring a secure and streamlined user experience.



---
## Section: Prerequisites

### Before you start, ensure you have the following

* About 60 minutes
* WSO2 Identity Server [setup](https://is.docs.wso2.com/en/latest/get-started/quick-set-up/){:target="_blank"}
* [Node.js](https://nodejs.org/en/download/package-manager){:target="_blank"} v20+ and npm
* Access to the [Google Developer Console](https://console.developers.google.com/apis/credentials)
* A favorite text editor or IDE




!!! note "Note"

    You need to have installed [Node.js](https://nodejs.org/en/download/package-manager){:target="_blank"} v18.8+ and npm (which comes inbuilt with Node) to run this sample. Although Node.js is primarily a server-side language,it needs to have been installed to manage dependencies and run scripts for our project.




---
## Section: Register an application

First unless you already have done that, you need to register your application as a Traditional Web Application.

* Download and [setup WSO2 Identity Server](https://is.docs.wso2.com/en/latest/get-started/quick-set-up/){:target="_blank"}
* Sign in to {{product_name}} console and navigate to **Applications > New Application.**
* Select **Traditional Web Application** (*Make sure that the protocol remains set to OpenID Connect (OIDC)*)

![Select Traditional Page Application]({{base_path}}/assets/img/complete-guides/app-native/image1.png){: width="800" style="display: block; margin: 0;"}

Next, complete the wizard popup by providing a suitable name and an authorized redirect URL.

!!! Example

    **Name**: {{product}}-nextjs

    **Authorized redirect URL**: http://localhost:3000

![Register a new application]({{base_path}}/assets/img/complete-guides/app-native/image2.png){: width="800" style="display: block; margin: 0;"}

!!! Info

    The authorized redirect URL determines where {{ base_path }} should send users after they successfully log in. Typically, this will be the web address where your application is hosted. For this guide, we'll use `http://localhost:3000`, as the sample application will be accessible at this URL

Make a note of the following values from the **Protocol** tab of the registered application. You will need them to configure Asgardeo provider for Auth.js.

* **`Client ID`**
* **`Client Secret`**

![Protocol tab]({{base_path}}/assets/img/complete-guides/app-native/image3.png){: width="800" style="display: block; margin: 0;"}


Since App Native Authentication is used, to enable this navigate to the `Advanced` section of the Application and tick the option for `Enable app-native authentication API` and click on the `Update` button to save the changes.

![Advanced tab Configurations]({{base_path}}/assets/img/complete-guides/app-native/image7.png){: width="800" style="display: block; margin: 0;"}

In this step, we have registered our Next.js app as an application with app-native authentication in the {{product_name}} console and generated the required metadata. Next, we will create a Next.js app.



---
## Section: Create an app for app-native authentication


For this guide, we will walk you through setting up a simple Next.js application.

Open a terminal, change directory to where you want to initialize the project, and run the following command to create your first Next.js sample app.

Running the above command will generate a new folder named {{ product }}-nextjs, containing a ready-to-use Next.js project set up with TypeScript. The project includes a development server that automatically reloads the app whenever changes are made.

=== "npm"

    ``` bash
    npm create next-app@latest {{ product }}-nextjs -- --yes
    ```

=== "yarn"

    ``` bash
    yarn create next-app@latest {{ product }}-nextjs -- --yes
    ```

=== "pnpm"

    ``` bash
    pnpm create next-app@latest {{ product }}-nextjs -- --yes
    ```

Once this command is executed, if everything goes smoothly, your terminal output should resemble the following.

![Create Next.js app]({{base_path}}/assets/img/complete-guides/app-native/image8.png){: width="800" style="display: block; margin: 0;"}

Once the application is created, navigate to the app folder. Then run the sample in the development mode. This allows you to see real-time updates and debug the app as you make changes.

=== "npm"

    ``` bash
    cd {{ product }}-nextjs
    npm run dev
    ```

=== "yarn"

    ``` bash
    cd {{ product }}-nextjs
    yarn dev
    ```

=== "pnpm"

    ``` bash
    cd {{ product }}-nextjs
    pnpm dev
    ```

This will start the Next.js development server, typically at [http://localhost:3000](http://localhost:3000){:target="_blank"}, and you should see the default Next.js starter page. Confirm that everything is set up correctly by checking for the terminal output indicating that the server is running.

![Navigate to localhost]({{base_path}}/assets/img/complete-guides/app-native/image9.png){: width="800" style="display: block; margin: 0;"}

At this point, you have a simple yet fully functional Next.js app. Now, it's time to integrate user authentication within the application. For this guide, we will be using the auth.js library, which provides a simple and secure way to handle authentication in Next.js apps.  



---
## Section: Configure Asgardeo SDK

### Install `@asgardeo/nextjs`

Asgardeo Next.js SDK provides all the components and hooks you need to integrate {{ product_name }} into your app. To get started, simply add the Asgardeo Next.js SDK to the project. Make sure to stop the dev server started in the previous step.

=== "npm"

    ``` bash
    npm install @asgardeo/nextjs
    ```

=== "yarn"

    ``` bash
    yarn add @asgardeo/nextjs
    ```

=== "pnpm"

    ``` bash
    pnpm add @asgardeo/nextjs
    ```

### Set up environment variables

Create a `.env` or an appropriate environment configuration file in the root of your Next.js project. This file will store all the configuration values required for the Asgardeo Next.js SDK to function properly.

```bash title=".env"
NEXT_PUBLIC_ASGARDEO_BASE_URL="{{content.sdkconfig.baseUrl}}"
NEXT_PUBLIC_ASGARDEO_CLIENT_ID="<your-app-client-id>"
ASGARDEO_CLIENT_SECRET="<your-app-client-secret>"
```

!!! danger "Warning"

    There is a Secret used for signing JWT session cookies. If this is not defined, it will use the default one configured in the Asgardeo SDK. However it is mandatory to change this in a production environment.

    Please generate a random key with the following.

    ```bash
    openssl rand -base64 32
    ```
    Add it to the .env file as below.

    ```bash
    ASGARDEO_SECRET="<your-secret-key-for-jwt-signing>"
    ```

### Setup the middleware

Create a file called `middleware.ts` in the root of your Next.js project and integrate the `asgardeoMiddleware` from the Asgardeo Next.js SDK.

The `asgardeoMiddleware` helper integrates Asgardeo authentication into your Next.js application and supports both the App and Pages routers.

```bash title="middleware.ts"
import {asgardeoMiddleware} from '@asgardeo/nextjs/server';

export default asgardeoMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Add `<AsgardeoProvider />` to your app

The `<AsgardeoProvider />` serves as a context provider for the SDK. You can integrate this provider to your app by wrapping the root component.

Add the following changes to the `app/layout.tsx` file in your Next.js project.

```javascript title="app/layout.tsx" hl_lines="3 31"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {AsgardeoProvider} from '@asgardeo/nextjs/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AsgardeoProvider>{children}</AsgardeoProvider>
      </body>
    </html>
  );
}
```



---
## Section: Add login and logout


Asgardeo SDK provides `SignInButton`, `SignOutButton` components to handle user sign-in and sign-out. You can use these components along side `SignedIn` and `SignedOut` components to conditionally render content based on the user's logged in state.

Replace the existing content of the `app/page.tsx` file with following content.

```javascript title="app/page.tsx"
'use client'

import { SignedIn, SignedOut, SignInButton, SignOutButton, User, UserDropdown, UserProfile } from '@asgardeo/nextjs';

export default function Home() {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <header className="flex flex-col items-center gap-2">
        <SignedIn>
          <UserDropdown />
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </header>
      <main className="flex flex-col items-center gap-4">
        <SignedIn>
          <User>
            {(user) => (
              <div>
                <p>Welcome back, {user.userName || user.username || user.sub}</p>
              </div>
            )}
          </User>
          <UserProfile />
        </SignedIn>
      </main>
      </div>
    </>
  );
}
```

This code snippet adds a login button in the application as well as displays user profile and a dropdown when the user is signed in.

However since app native authentication needs to be used, the following can be done to integrate the Asgardeo Next SDK with {{product_name}}. Since you have already enabled app-native authentication in the {{product_name}} side during step 3, you can add the below logic to the application.

First, create an app route for the sign-in page. Create a new file called `app/sign-in/page.tsx` and add the following code:

```javascript title="app/sign-in/page.tsx"
'use client'

import { SignIn } from '@asgardeo/nextjs';

export default function SignInPage() {
  return <SignIn />;
}
```

Then, update the `.env` file with the route for the sign-in page. Add the following line to your `.env` file:

```bash title=".env"
NEXT_PUBLIC_ASGARDEO_SIGN_IN_URL="/sign-in"
```

Save the changes and re-run the application in development mode if it is not running already.

```bash
npm run dev
```

Once the application is started, you will see the homepage of the application with the changes we made.

![Login screen]({{base_path}}/assets/img/complete-guides/app-native/image16.png){: width="800" style="display: block; margin: 0;"}

### Initiate Sign In

Clicking on the login button will initiate the app native authentication sign in as shown below.

![OIDC request]({{base_path}}/assets/img/complete-guides/app-native/image17.png){: width="800" style="display: block; margin: 0;"}

The credentials entered here will be used to obtain an access token from {{product_name}}

At this stage, you should have already created a test user in {{product_name}}, as outlined in the [prerequisite]({{ base_path }}/complete-guides/app-native/prerequisites) section. Now can enter the username and password of the test user to the login screen.



---
## Section: Add MFA using app-native APIs


Multi-factor authentication (MFA) is a security mechanism that requires users to provide two or more forms of verification before granting access to an application. This adds an extra layer of security to your application and helps protect sensitive data from unauthorized access.

In this guide, we will look into enabling Email OTP as an MFA factor in your Next.js application. Email OTP is a simple and effective MFA method that sends a one-time passcode to the user's email address, which they must enter to complete the login process.

{% if product_name == 'Asgardeo' %}

You can configure SMTP settings in the {{product_name}} Console by navigating to the **Notification Channels** tab > **Email Provider** section. In Asgardeo you can simply use default Asgardeo SMTP settings available out of the box without configuring an  **Email Provider**.

{% else %}

You can configure SMTP settings in the {{product_name}} Console by navigating adding the SMTP configurations in the deployment.toml file.

{% endif %}

First, let's set up Email OTP as an MFA factor by following the steps given below.

- Navigate to the {{product_name}} Console and select your application under the **Applications** tab.
- Click on the **Login Flow** tab.
- Click on either the **+** button in the Visual Editor and select **Email OTP** from the pop-up prompt or click on **Username & Password -> Email OTP** button under the **Predefined Flows > Basic Login Flows > Add Multi-factor Login** section.

  ![Visual Editor]({{base_path}}/assets/img/complete-guides/app-native/image12.png){: width="800" style="display: block; margin: 0;"}
- Click on the **Update** button to save the changes.

You can now test the Email OTP MFA factor in your Next.js application. When a user logs in with their email and password, they will be redirected to the Email OTP page to enter the OTP code sent to their email address. Upon successful verification, the user will be redirected to the home page.

![Email OTP Page]({{base_path}}/assets/img/complete-guides/app-native/image13.png){: width="800" style="display: block; margin: 0;"}



---
## Section: Add Social Login using app-native APIs


To enable social login in your app, you need to register your application with the social login provider and configure the necessary settings. This step will walk you through the process of adding social login to your app using the app-native authentication APIs in {{product_name}}. For the purpose of this guide we will use Google as the social login option.

First, follow the guidance provided in our [documentation]({{ base_path }}/guides/authentication/social-login/add-google-login/) to configure Google as a connection in {{product_name}} while taking a note of the values to be configured as provided below.

- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized Redirect URI**:  `http://localhost:3000`

We need to configure the above values (make sure they contain the hostname/port combination utilized in your application) instead of the values suggested in the documentation because we are using app-native authentication and require the application to handle the callback from Google first before redirecting to the {{product_name}} APIs.

Let's now set up Google as an option as the first authentication step in your {{product_name}} application as given below.

- Navigate to the {{product_name}} Console and select your application under the **Applications** tab.
- Click on the **Login Flow** tab.
- Click on the **Add Sign In Option** button as shown below and add the Google connection from the popup prompt.
  ![Visual Editor]({{base_path}}/assets/img/complete-guides/app-native/image14.png){: width="800" style="display: block; margin: 0;"}
- Click on the **Update** button to save the changes.

Once this is added to the login flow as one of the first factor options, you should now be able to successfully sign in with Google in your Next.js application. After clicking on the `Sign In With Google` button, the user will be redirected to the Google sign-in page, and upon successful sign-in, the user will be redirected back to the application to complete the second authentication step (i.e. in this case email OTP) before being redirected to the home page. After signing in you should be able to see the relevant user's first and last name along with the `Sign Out` button.

![Sign In With Google Button]({{base_path}}/assets/img/complete-guides/app-native/image15.png){: width="800" style="display: block; margin: 0;"}

!!! tip "Tip"

    If you need to display the User Information properly in the application after a successful Sign In with the Google Connector, make sure you have enabled JIT provisioning in the connector configurations. You can follow the documentation for [JIT Provisioning]({{base_path}}/guides/authentication/jit-user-provisioning) for this.



---
## Section: Manage tokens in app-native apps


### Token Validation

A key principle of security tokens is that the receiver must first validate the token. This involves checking the authenticity of the token issuer, ensuring the token meets validity criteria such as expiration time, and confirming that the receiver is authorized to use the token. The Asgardeo SDK handles token validation automatically as part of its authentication and session management process to ensure that users have valid and unexpired tokens when accessing protected resources.

When a user signs in, the Asgardeo  SDK acquires an access token (and often an ID token) from {{product_name}}. The access token is by default an opaque token and the ID token is in the form of JSON Web Tokens (JWTs). The SDK automatically validates the token when it is obtained. This involves several checks:

- **Signature Validation:** The SDK verifies the JWT's signature using the public key retrieved from {{product_name}} JWKS endpoint. This ensures that the token has been issued by a trusted authority and has not been tampered with.

- **Expiration Check:** The SDK checks the `exp` (expiration) claim in the token to ensure it has not expired. Tokens are time-bound, and once the expiration time is reached, the token is considered invalid.

- **Issuer Validation:** The SDK verifies that the `iss` (issuer) claim in the token matches the expected issuer URL, which is typically the base URL specified in the .env file.

- **Audience Validation:** The SDK checks the aud (audience) claim to ensure the token is intended for your application (identified by the `clientID` in your .env file).

### Token Persistence

In the Asgardeo SDK, by default, an in memory token storage is used to store access tokens.

### Initiate Logout

The Asgardeo SDK provides a simple approach  to handle user logout from your app. When a user logs out, the SDK ensures that both the local session and the session on the {{product_name}} are terminated, ensuring a complete and secure logout process and you don’t need to worry on cleanup activities

When a user initiates log out, the following steps typically occur.

- **Local Session Termination:** The SDK clears any locally stored credentials, such as the access token and the ID token, which are used to maintain the user's authentication state within the application. This effectively logs the user out of the application locally.

- **Redirection to {{product_name}} for sign out:** After clearing the local session, the SDK redirects the user to the sign-out endpoint of your {{product_name}} organization. This ensures that the user is also signed out globally from {{product_name}}. It’s particularly important in single sign-on (SSO) scenarios where the user might be logged into multiple applications under the same identity.

- **Post Sign-Out Redirection:** Once the global sign-out is complete, the user is redirected back to a specified URL, usually the application's homepage or a custom logout page, which is configured in the SDK's authConfig under signOutRedirectURL.



---
## Section: Next Steps


This guide you just completed covered how to add user authentication to a Next.js application using Next Asgardeo SDK and an Identity Provider (IdP) like **{{product_name}}**. It also explored making authenticated requests to an OAuth2-protected API.

---

Now that your Next.js application is set up with app-native authentication, it's time to explore more on the features that {{product_name}} offers to enhance security and flexibility in your app-native authentication flow:

- [Secure app-native authentication flows]({{ base_path }}/guides/authentication/app-native-authentication/secure-app-native-authentication-flows/){:target="_blank"}
- [Handle Advanced Login Scenarios]({{ base_path }}/guides/authentication/app-native-authentication/handle-advanced-login-scenarios/){:target="_blank"}

