// init scrollMagic controller
var controller = new ScrollMagic.Controller({
    globalSceneOptions: { triggerHook: 0.6 },
});
var paralaxCtrl = new ScrollMagic.Controller({
    globalSceneOptions: { triggerHook: 0.75 },
    // addIndicators: true,
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
 * @param {Element} elem
 * @param {String} classname
 */
function addClass (elem, classname) {
    if (classname) {
        if (elem.classList) elem.classList.add(classname);
        else elem.className += ' ' + classname;
    }
}
/**
 * @param {Element} elem
 * @param {String} classname
 */
function removeClass (elem, classname) {
    if (classname) {
        if (elem.classList) elem.classList.remove(classname);
        else elem.className = elem.className
            .replace(new RegExp('(^|\\b)' + classname.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
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
 * @param {String} cacheKey
 * @return {Number}
 */
function getSectionDuration(cacheKey) {
    return Math.round(durationCache[cacheKey].height || 0);
}
function getSectionLeftEdge(cacheKey) {
    return Math.round(durationCache[cacheKey].left || 0);
}

/** @desc Recalculate dimensions of sections on window resize */
function onResize() {
    for (var key in sections) {
        var node = sections[key].el;
        durationCache[key] = node.getBoundingClientRect();
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
var bootTween = new TimelineMax({ paused: true });
window.addEventListener('load', function() {
    // Scroll does not seem to work imediately,
    // so we'll force it to the end of the queue
    setTimeout(function () {
        window.scrollTo(0, 0);
        bootTween.play();

        // Prevents certain "autoplay" animations
        // from playing when the page is scrolled
        // in the background (before load)
        booted = true;
    }, 0);
});

var booted = false;
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
var mouseIsOut = false; // Mouse will be hidden on first scroll
var $headerHand = $header.querySelector('.hand');
var $headerStaggerSet = $header.querySelectorAll('.content > *');

var $pager = gebi('pager');
var $pagerPages = pager.querySelectorAll('.page');

bootTween
    // Letters in
    .staggerTo($bootLogoLetters, 0.6, { autoAlpha: 1, scale: 1 }, 0.2, '+=0.5')

    // Sub-line in
    .to($bootLogoSubline, 3, { autoAlpha: 1, scale: 1 })

    // Whole logo out
    .to($bootLogo, 1, { autoAlpha: 0 })

    // Whole boot out + "remove"
    .to($boot, 1, { autoAlpha: 0 });

// Split-off header content to it's own sub-timeline
// so that we can be sure that all is concurent
//  => $headerHand's position can be set to '0'
var headerContentTimeline = new TimelineMax();
headerContentTimeline
    .staggerFrom($headerStaggerSet, 1, { y: '-40%', autoAlpha: 0 })

    // Slide-in hand
    .fromTo($headerHand, $headerStaggerSet.length / 2,
        { x: '100%', scale: 1.3 },
        { x: '0%', scale: 1, ease: Power2.easeOut },
        '0'
    )

    // Slide-up mouse glyph
    .set($headerMouse, { autoAlpha: 1 })
    .from($headerMouse, 1, { y: 300, ease: Back.easeOut.config(1.7) }, '-=0.6')

    // Zoom-in pager circles
    .from($pagerPages, 2, { autoAlpha: 0, scale: 0, ease: Power2.easeOut }, 1);

// Add to parent timeline
bootTween.add(headerContentTimeline, '-=0.7');


/**
 * # Header
 */
new ScrollMagic.Scene({
    triggerElement: sections.header.el,
    duration: getSectionDuration.bind(null, 'header'),
})
    .setClassToggle(sections.header.menu, 'active')
    // .addIndicators()
    .addTo(controller)

    .on('end', function(event) {
        if (event.scrollDirection === 'FORWARD' && !mouseIsOut)
            TweenLite.to($headerMouse, 1, { autoAlpha: 0 })
    });


/**
 * ## Paralax
 * Background claims + slower hand
 * CSS-animated transition is already used on hand, so we'll use margin instead
 */
var paralaxTimelineHeader = new TimelineMax();
paralaxTimelineHeader.to('#header .bgClaims', 1, { y: '100%', ease: Linear.easeNone });
paralaxTimelineHeader.to('#header .hand', 1.3, { marginBottom: -500, ease: Linear.easeNone }, 0);
paralaxTimelineHeader.to('#header .content', 1.3, { y: 200, opacity: 0, ease: Linear.easeNone }, 0);

new ScrollMagic.Scene({ triggerElement: sections.why.el, duration: '100%' })
    .setTween(paralaxTimelineHeader)
    // .addIndicators({name: "'Header' paralax"})
    .addTo(paralaxCtrl);



/**
 * # Why
 */
var __why__ = {
    $num: gebi('why--num'),
    values: { over65: 549 },
};
new ScrollMagic.Scene({
    triggerElement: sections.why.el,
    duration: getSectionDuration.bind(null, 'why'),
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
 * # How
 *  - Slide-up columns (floor-plan slower)
 *  - floor plan sequence
 */
// Set initial state
TweenLite.set('#how .raised', { y: '50%', opacity: 0.6 });
TweenLite.set('#how .how--map', { y: '50%', opacity: 0.6 });
var howFloorPlanSequence = new TimelineMax({ paused: true });
howFloorPlanSequence
    .staggerTo(['#how .raised', '#how .how--map'], 1,
        { y: '0%', opacity: 1, ease: Power3.easeOut }, 0.2
    );

var $devices = sections.how.el.querySelector('.how--house--devices');
var $devImgs = $devices.querySelectorAll('.img');
var $devLbls = $devices.querySelectorAll('.label');

var $devCircles = sections.how.el.querySelectorAll('.pulseCircle');
var circlesTimeline = new TimelineMax({ repeat: -1 });

(function(els) {
    for (var i = 0; i < els.length; i++) {
        var tl = new TimelineMax()
            .fromTo(els[i], 1.8,
                { scale: 0 },
                { scale: 2, ease: Power3.easeOut })
            .to(els[i], 1,
                { autoAlpha: 0, ease: Power3.easeOut }, '-=1');

        circlesTimeline.add(tl, i * 0.3);
    }
})($devCircles);


howFloorPlanSequence
    // Fade-in images
    .staggerFrom($devImgs, 2, { scale: 0.2 }, 0.3)

    // Slide-in logo
    .staggerFrom(['.how--head--head', '.how--head--logo'], 2, { y: '-10px', opacity: 0 }, 0.3, '-=2')

    // Then labels
    .staggerFrom($devLbls, 1, { opacity: 0 }, 0.3, '-=2')

    // Loop pulsing circles
    .add(circlesTimeline, '-=1');

var howEntered = false;
new ScrollMagic.Scene({
    triggerElement: sections.how.el,
    duration: getSectionDuration.bind(null, 'how'),
})
    .setClassToggle(sections.how.menu, 'active')
    .addTo(controller)

    .on('start', function (event) {
        if (event.scrollDirection !== 'FORWARD' || howEntered || !booted) return;
        howEntered = true;
        howFloorPlanSequence.play(0);
    });




/**
 * # Who
 */
new ScrollMagic.Scene({
    triggerElement: sections.who.el,
    duration: getSectionDuration.bind(null, 'who'),
})
    .setClassToggle(sections.who.menu, 'active')
    // .addIndicators()
    .addTo(controller);

/**
 * ## Paralax
 * Slide-up columns (floor-plan slower)
 */
var paralaxTimelineWho = new TimelineMax({ paused: true });
var $userWraps = sections.who.el.querySelectorAll('.who--user--wrap');

// Fade-in wrappers
paralaxTimelineWho.staggerFrom($userWraps, 1.3, { opacity: 0, scale: 0.2 }, 0.5);


var whoEntered = false;
new ScrollMagic.Scene({ triggerElement: sections.who.el, duration: '50%' })
    .addTo(paralaxCtrl)
    .on('start', function (event) {
        if (event.scrollDirection !== 'FORWARD' || whoEntered || !booted) return;
        whoEntered = true;
        paralaxTimelineWho.play(0);
    });


/**
 * # Footer
 */
new ScrollMagic.Scene({
    triggerElement: sections.footer.el,
    duration: getSectionDuration.bind(null, 'footer'),
})
    .setClassToggle(sections.footer.menu, 'active')
    .addTo(controller);


/**
 * ## Paralax
 * Slide-up columns (floor-plan slower)
 */
var paralaxTimelineFooter = new TimelineMax();
var $footerEntries = sections.footer.el.querySelectorAll('.entry');
var $footerLabels = sections.footer.el.querySelectorAll('.entry .label');

paralaxTimelineFooter
    // Fade-in wrappers
    .staggerFrom($footerEntries, 1.3, { opacity: 0, scale: 0.75 }, 0.5, '+=0.5')

    // Fade-in labels
    .staggerFrom($footerLabels, 1.3, { opacity: 0 }, 0.5, '-=2');


var footerEntered = false;
new ScrollMagic.Scene({ triggerElement: sections.footer.el, duration: '100%' })
    .addTo(paralaxCtrl)
    .on('start', function (event) {
        if (event.scrollDirection !== 'FORWARD' || footerEntered || !booted) return;
        footerEntered = true;
        paralaxTimelineFooter.play(0);
    });


/**
 * @desc
 * Each menu item will have it's own controller
 * with 2 scenes (2 purple sections).
 *
 * These sections goal is just to trigger a `.inverse` css class
 * on the respective menu item when it enters the pruple section
 */
menuItems.forEach(function(item, index) {
    // These values are calculated and used as percentages,
    // so they should be as stable as it gets and so
    // no recalculation should really be needed
    var bbox = item.getBoundingClientRect();
    var wh = document.documentElement.clientHeight;
    var cx = bbox.top - (bbox.height / 2);

    // Separate controller (=> trigger point) for each menu item
    var ctrl = new ScrollMagic.Controller({ globalSceneOptions: { triggerHook: cx / wh } });

    var s1 = new ScrollMagic.Scene({
        triggerElement: sections.why.el,
        duration: getSectionDuration.bind(null, 'why'),
    })
        .addTo(ctrl);

    var s2 = new ScrollMagic.Scene({
        triggerElement: sections.who.el,
        duration: getSectionDuration.bind(null, 'who'),
    })
        .addTo(ctrl);

    setClassToggle(s1, 'why',
        function() { return sections.why.el.classList.contains('left') },
        item, 'inverse');
    setClassToggle(s2, 'who',
        function() { return sections.who.el.classList.contains('left') },
        item, 'inverse');
});



/**
 * @desc port of scrollMagic's `setClassToggle` to allow for dinamic className logic
 *
 * @param {Object} scene
 * @param {String} cacheKey
 * @param {Function} isLeftGetter
 * @param {Element} element
 * @param {string} classes
 *
 * @return {undefined}
 */
function setClassToggle(scene, cacheKey, isLeftGetter, element, classes) {
    scene.on('enter.internal_class leave.internal_class', function(event) {
        if (!isLeftGetter()) return;
        (event.type === 'enter' ? addClass : removeClass)(element, classes);
    });
}
