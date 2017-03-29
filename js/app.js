// init scrollMagic controller
var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
        triggerHook: 0.6,
        loglevel: 2,
    }
});
var paralaxCtrl = new ScrollMagic.Controller({
    globalSceneOptions: {
        triggerHook: 0.75,
        loglevel: 2,
    }
});

/**
 * Change behaviour of controller
 * to animate scroll instead of jump
 */
controller.scrollTo(function scroll(newpos) {
    TweenLite.to(window, 1.5, { scrollTo: { y: newpos }, ease: Power2.easeOut });
});


/** Helpers / caches */
var pager = gebi('pager');
var menuItems = [];

/**
 * @param {String} id
 * @return {Element}
 */
function gebi(id) { return document.getElementById(id) }

/**
 * @param {Node} elem
 * @param {String} classname
 */
function addClass (elem, classname) {
    if (classname) {
        if (elem.classList) elem.classList.add(classname);
        else elem.className += ' ' + classname;
    }
}
/**
 * @param {Node} elem
 * @param {String} classname
 */
function removeClass (elem, classname) {
    if (classname) {
        if (elem.classList) elem.classList.remove(classname);
        else elem.className = elem.className.replace(new RegExp('(^|\\b)' + classname.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}


/**
 * @desc <div class="page" onclick="…" />
 * @param {Node} target
 * @return {Node}
 */
function addMenuItem (target) {
    var div = document.createElement('div');
    div.className = 'page';

    /** Bind scroll controls */
    div.onclick = function click(e) {
        if (!target) console.error('Target does not supplied', target);

        e.preventDefault();
        controller.scrollTo(target);
    };

    menuItems.push(div);
    return pager.appendChild(div);
}


var sections = {};
sections.header = { el: gebi('header') };
sections.why = { el: gebi('why') };
sections.how = { el: gebi('how') };
sections.who = { el: gebi('who') };
sections.footer = { el: gebi('footer') };

sections.header.menu = addMenuItem(sections.header.el);
sections.why.menu = addMenuItem(sections.why.el);
sections.how.menu = addMenuItem(sections.how.el);
sections.who.menu = addMenuItem(sections.who.el);
sections.footer.menu = addMenuItem(sections.footer.el);




var durationCache = {};
/**
 * @desc Get cached value of section duration
 *
 * @param {String} cacheKey
 * @param {Node} node
 *
 * @return {Number}
 */
function getSectionDuration(cacheKey, node) {
    return durationCache[cacheKey] || 0;
}

/** @desc Recalculate dimensions of sections on window resize */
function onResize() {
    for (var key in sections) {
        var node = sections[key].el;
        durationCache[key] = Math.round(node.getBoundingClientRect().height);
    }
}
window.addEventListener('resize', onResize);
onResize();


/** Build scenes */

/**
 * # Boot sequence (on content load)
 * 1. full-screen logo in & out
 * 2. header content in
 */
var bootTween = new TimelineLite({ paused: true });
window.addEventListener('load', function() {
    // Scroll does not seem to work imediately,
    // so we'll force it to the end of the queue
    setTimeout(function () {
        window.scrollTo(0, 0);
        bootTween.play();
    }, 0);
});

var $boot = gebi('boot');
var $bootLogo = gebi('boot--logo');

/**
 * The logo animation goes in particular orderm,
 * so the stagger* elements must be selected accordingly.
 *
 * 1 | 4 | 3 | 2
 * A | I | V | A
 */
var $bootLogoLetters = [
    $bootLogo.querySelector('.a1'),
    $bootLogo.querySelector('.a2'),
    $bootLogo.querySelector('.v'),
    $bootLogo.querySelector('.i')
];
var $bootLogoSubline = $bootLogo.querySelector('.sub');

var $header = gebi('header');
var $headerMouse = $header.querySelector('.mouse');
var $headerHand = $header.querySelector('.hand');
var $headerStaggerSet = $header.querySelectorAll('.content > *');

var $pager = gebi('pager');
var $pagerPages = pager.querySelectorAll('.page');

bootTween
    .to(window, 0, { scrollTo: { y: 0 } })
    // Letters in
    .staggerTo($bootLogoLetters, 0.6, { opacity: 1, scale: 1 }, 0.2, '+=0.5')

    // Sub-line in
    .to($bootLogoSubline, 3, { opacity: 1, scale: 1 })

    // Whole logo out
    .to($bootLogo, 1, { opacity: 0 })

    // Whole boot out + "remove"
    .to($boot, 1, { opacity: 0 })
    .to($boot, 0, { display: 'none' });

// Split-off header content to it's own sub-timeline
// so that we can be sure that all is concurent
//  => $headerHand's position can be set to '0'
var headerContentTimeline = new TimelineLite();
headerContentTimeline
    .staggerFrom($headerStaggerSet, 1, { y: '-40%', opacity: 0 })

    // Slide-in hand
    .fromTo($headerHand, $headerStaggerSet.length / 2,
        { x: '100%', scale: 1.3 },
        { x: '0%', scale: 1, ease: Power2.easeOut },
        '0'
    )

    // Slide-up mouse glyph
    .from($headerMouse, 1, { y: 300, ease: Back.easeOut.config(1.7) }, '-=0.6')

    // Zoom-in pager circles
    .from($pagerPages, 2, { opacity: 0, scale: 0, ease: Power2.easeOut }, 1);

// Add to parent timeline
bootTween.add(headerContentTimeline, '-=0.7');


/**
 * # Header
 */
new ScrollMagic.Scene({
    triggerElement: sections.header.el,
    duration: getSectionDuration.bind(null, 'header', sections.header.el),
})
    .setClassToggle(sections.header.menu, 'active')
    // .addIndicators()
    .addTo(controller);


/**
 * # Why
 */
var __why__ = {
    $num: gebi('why--num'),
    values: { over65: 549 },
};
new ScrollMagic.Scene({
    triggerElement: sections.why.el,
    duration: getSectionDuration.bind(null, 'why', sections.why.el),
})
    .setClassToggle(sections.why.menu, 'active')
    // .addIndicators()
    // Tween the 65' if it's not already there
    .on('enter', function() {
        if (__why__.values.over65 !== 560) {
            TweenLite.to(__why__.values, 2, {
                over65: 560,
                onUpdate: function () { __why__.$num.innerHTML = __why__.values.over65; },
                roundProps: ['over65'],
                ease: Power2.easeOut,
            });
        }
    })

    .addTo(controller);

/**
 * ## Paralax
 * Background claims + slower hand
 * CSS-animated transition is already used on hand, so we'll use margin instead
 */
var paralaxTimelineHeader = new TimelineLite();
paralaxTimelineHeader.to('#header .bgClaims', 1, { y: '100%', ease: Linear.easeNone });
paralaxTimelineHeader.to('#header .hand', 1.3, { marginBottom: -500, ease: Linear.easeNone }, '0');

new ScrollMagic.Scene({ triggerElement: sections.why.el, duration: '100%' })
    .setTween(paralaxTimelineHeader)
    // .addIndicators({name: "'Header' paralax"})
    .addTo(paralaxCtrl);


/**
 * # How
 */
new ScrollMagic.Scene({
    triggerElement: sections.how.el,
    duration: getSectionDuration.bind(null, 'how', sections.how.el),
})
    .setClassToggle(sections.how.menu, 'active')
    // .addIndicators()
    .addTo(controller);

/**
 * ## Paralax
 * Slide-up columns (floor-plan slower)
 */
var paralaxTimelineHow = new TimelineLite();
paralaxTimelineHow
    .from('#how .raised', 2, { y: '50%', opacity: 0.6, ease: Linear.easeNone })
    .from('#how .how--map', 2.2, { y: '50%', opacity: 0.6, ease: Linear.easeNone });

var $devices = sections.how.el.querySelector('.how--house--devices');
var $devImgs = $devices.querySelectorAll('.img');
var $devLbls = $devices.querySelectorAll('.label');

paralaxTimelineHow
    // Fade-in images
    .staggerFrom($devImgs, 4, { scale: 0.2 }, 0.3, '+=1')

    // Slide-in logo
    .staggerFrom(['.how--head--head', '.how--head--logo'], 4, { y: '-10px', opacity: 0 }, 0.3, '-=5')

    // Then labels
    .staggerFrom($devLbls, 1, { opacity: 0 }, 0.3, '-=4');

    // .call(addClass, [sections.how.el, 'show-circles'], null, '-=1');


new ScrollMagic.Scene({ triggerElement: sections.how.el, duration: '100%', offset: -100 })
    .setTween(paralaxTimelineHow)
    // .addIndicators({name: "'How' paralax"})
    .addTo(paralaxCtrl);


/**
 * # Who
 */
new ScrollMagic.Scene({
    triggerElement: sections.who.el,
    duration: getSectionDuration.bind(null, 'who', sections.who.el),
})
    .setClassToggle(sections.who.menu, 'active')
    // .addIndicators()
    .addTo(controller);

/**
 * ## Paralax
 * Slide-up columns (floor-plan slower)
 */
var paralaxTimelineWho = new TimelineLite();
var $userWraps = sections.who.el.querySelectorAll('.who--user--wrap');

// Fade-in wrappers
paralaxTimelineWho.staggerFrom($userWraps, 3, { opacity: 0, scale: 0.2 }, 0.5);


new ScrollMagic.Scene({ triggerElement: sections.who.el, duration: '50%' })
    .setTween(paralaxTimelineWho)
    // .addIndicators({name: "'Who' paralax"})
    .addTo(paralaxCtrl);


/**
 * # Footer
 */
new ScrollMagic.Scene({
    triggerElement: sections.footer.el,
    duration: getSectionDuration.bind(null, 'footer', sections.footer.el),
})
    .setClassToggle(sections.footer.menu, 'active')
    // .addIndicators()
    .addTo(controller);


/**
 * ## Paralax
 * Slide-up columns (floor-plan slower)
 */
var paralaxTimelineFooter = new TimelineLite();
var $footerEntries = sections.footer.el.querySelectorAll('.entry');
var $footerLabels = sections.footer.el.querySelectorAll('.entry .label');

paralaxTimelineFooter
    // Fade-in wrappers
    .staggerFrom($footerEntries, 3, { opacity: 0, scale: 0.75 }, 0.5, '+=0.5')

    // Fade-in labels
    .staggerFrom($footerLabels, 3, { opacity: 0 }, 0.5, '-=2');


new ScrollMagic.Scene({ triggerElement: sections.footer.el, duration: '100%' })
    .setTween(paralaxTimelineFooter)
    // .addIndicators({name: "'Who' paralax"})
    .addTo(paralaxCtrl);
