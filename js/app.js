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
    .staggerFrom($devLbls, 4, { opacity: 0 }, 0.3, '-=3');


new ScrollMagic.Scene({ triggerElement: sections.how.el, duration: '100%' })
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
