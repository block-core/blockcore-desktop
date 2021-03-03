// TODO: Not able to get animations to work when naving across pages, but it does run... so leaving until future testing.

// import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';

// export const slideInAnimation =
//     trigger('routeAnimations', [
//         transition('LoginPage <=> AdvancedPage', [
//             style({ position: 'relative' }),
//             query(':enter, :leave', [
//                 style({
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%'
//                 })
//             ]),
//             query(':enter', [
//                 style({ left: '-100%' })
//             ]),
//             query(':leave', animateChild()),
//             group([
//                 query(':leave', [
//                     animate('300ms ease-out', style({ left: '100%' }))
//                 ]),
//                 query(':enter', [
//                     animate('300ms ease-out', style({ left: '0%' }))
//                 ])
//             ]),
//             query(':enter', animateChild()),
//         ]),
//         transition('AboutPage <=> StatusPage', [
//             style({ position: 'relative' }),
//             query(':enter, :leave', [
//                 style({
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%'
//                 })
//             ]),
//             query(':enter', [
//                 style({ left: '-100%' })
//             ]),
//             query(':leave', animateChild()),
//             group([
//                 query(':leave', [
//                     animate('300ms ease-out', style({ left: '100%' }))
//                 ]),
//                 query(':enter', [
//                     animate('300ms ease-out', style({ left: '0%' }))
//                 ])
//             ]),
//             query(':enter', animateChild()),
//         ]),
//         transition('NotificationPage <=> StatusPage', [
//             style({ position: 'relative' }),
//             query(':enter, :leave', [
//                 style({
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%'
//                 })
//             ]),
//             query(':enter', [style({ left: '-100%', opacity: 0 })]),
//             query(':leave', animateChild()),
//             group([
//                 query(':leave', [animate('1s ease-out', style({ left: '100%', opacity: 0 }))]),
//                 query(':enter', [animate('1s ease-out', style({ left: '0%', opacity: 1 }))])
//             ]),
//             query(':enter', animateChild())
//         ]),
//         transition('DashboardPage <=> WalletPage', [
//             style({ position: 'relative' }),
//             query(':enter, :leave', [
//                 style({
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%'
//                 })
//             ]),
//             query(':enter', [style({ left: '-100%', opacity: 0 })]),
//             query(':leave', animateChild()),
//             group([
//                 query(':leave', [animate('1s ease-out', style({ left: '100%', opacity: 0, filter: 'blur(10px)' }))]),
//                 query(':enter', [animate('1s ease-out', style({ left: '0%', opacity: 1, filter: 'blur(4px)' }))])
//             ]),
//             query(':enter', animateChild())
//         ]),
//         transition('* <=> FilterPage', [
//             style({ position: 'relative' }),
//             query(':enter, :leave', [
//                 style({
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%'
//                 })
//             ]),
//             query(':enter', [
//                 style({ left: '-100%' })
//             ]),
//             query(':leave', animateChild()),
//             group([
//                 query(':leave', [
//                     animate('200ms ease-out', style({ left: '100%' }))
//                 ]),
//                 query(':enter', [
//                     animate('300ms ease-out', style({ left: '0%' }))
//                 ])
//             ]),
//             query(':enter', animateChild()),
//         ])
//     ]);
