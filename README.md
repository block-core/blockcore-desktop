# City Hub

The City Hub is the one-stop-app that citizens, merchants and others can get an overview of 
everything related to their data on the City Chain and the Smart City Platform.
It is additionally a full features wallet app that supports multiple cryptocurrencies, 
such as City Coin (CITY), Bitcoin (BTC) and Stratis (STRAT).

Running the City Hub allows you to participate in staking of your City Coins, and help 
support the global network. 

Additionally you can turn on resource sharing for the Smart City Platform. If you enable 
being an Smart City Platform node, you will receive payments for storage, network and 
processing utilization from other users who user who needs premium services on the 
Smart City Platform.

![City Hub screenshot (2018-07-18)](doc/images/2018-07-18.png "City Hub (2018-07-18)")

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4201/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Icons

Find icons to use here: [Material Icons](https://material.io/tools/icons/?style=outline)

## Styling guidelines

Components should define a class on the container element, which has the same name as the component and its files.

The login.component.ts should contain the following host binding:

```ts
@HostBinding('class.login') hostClass = true;
```

The login.component.scss should have a root class that wraps all encapsulated local types within the component.

```css
.login
{
    height: 100%;
    width: 100%;

    .login-container
    {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
    }
}
```

All classes within a component encapsulation class, should be prefixed with the classname + dash, e.g. "login-".

This will generate a class definition:

```css
.login .login-container {}
```

With this configuration, it is easy to find the class that applies to an DOM element as you can quickly search for the name.

Example:

```html
<div class="login-container"></div>
```

Avoid generated class names, such as the following syntax:

```css
.login
{
    &-container {
        /* Do not do this. It is lazy, and makes it impossible to find definitions by searching. */
    }
}
```

# License

MIT @ City Chain Foundation   
MIT @ Stratisplatform   
