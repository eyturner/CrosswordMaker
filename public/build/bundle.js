
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/CellBox.svelte generated by Svelte v3.35.0 */

    const file$8 = "src/components/CellBox.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let p;
    	let t0_value = (/*cellContent*/ ctx[0].number || ".") + "";
    	let t0;
    	let p_class_value;
    	let t1;
    	let h3;
    	let t2_value = /*cellContent*/ ctx[0].letter + "";
    	let t2;
    	let div_class_value;
    	let div_id_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);

    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(/*cellContent*/ ctx[0].number
    			? "clueNumber"
    			: "blankNumber") + " svelte-je9quq"));

    			add_location(p, file$8, 12, 8, 318);
    			attr_dev(h3, "class", "svelte-je9quq");
    			add_location(h3, file$8, 15, 4, 433);
    			attr_dev(div, "tabindex", "-1");

    			attr_dev(div, "class", div_class_value = "" + ((/*cellContent*/ ctx[0].isBlackSquare
    			? "cell fill"
    			: "cell") + "\n                " + (/*inCurrentLine*/ ctx[2] ? "inCurrentLine" : "") + " svelte-je9quq"));

    			attr_dev(div, "id", div_id_value = /*currentCell*/ ctx[1] ? "currentCell" : "");
    			add_location(div, file$8, 6, 0, 105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cellContent*/ 1 && t0_value !== (t0_value = (/*cellContent*/ ctx[0].number || ".") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*cellContent*/ 1 && p_class_value !== (p_class_value = "" + (null_to_empty(/*cellContent*/ ctx[0].number
    			? "clueNumber"
    			: "blankNumber") + " svelte-je9quq"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*cellContent*/ 1 && t2_value !== (t2_value = /*cellContent*/ ctx[0].letter + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*cellContent, inCurrentLine*/ 5 && div_class_value !== (div_class_value = "" + ((/*cellContent*/ ctx[0].isBlackSquare
    			? "cell fill"
    			: "cell") + "\n                " + (/*inCurrentLine*/ ctx[2] ? "inCurrentLine" : "") + " svelte-je9quq"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*currentCell*/ 2 && div_id_value !== (div_id_value = /*currentCell*/ ctx[1] ? "currentCell" : "")) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CellBox", slots, []);
    	
    	let { cellContent } = $$props;
    	let { currentCell } = $$props;
    	let { inCurrentLine } = $$props;
    	const writable_props = ["cellContent", "currentCell", "inCurrentLine"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CellBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("cellContent" in $$props) $$invalidate(0, cellContent = $$props.cellContent);
    		if ("currentCell" in $$props) $$invalidate(1, currentCell = $$props.currentCell);
    		if ("inCurrentLine" in $$props) $$invalidate(2, inCurrentLine = $$props.inCurrentLine);
    	};

    	$$self.$capture_state = () => ({ cellContent, currentCell, inCurrentLine });

    	$$self.$inject_state = $$props => {
    		if ("cellContent" in $$props) $$invalidate(0, cellContent = $$props.cellContent);
    		if ("currentCell" in $$props) $$invalidate(1, currentCell = $$props.currentCell);
    		if ("inCurrentLine" in $$props) $$invalidate(2, inCurrentLine = $$props.inCurrentLine);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cellContent, currentCell, inCurrentLine];
    }

    class CellBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			cellContent: 0,
    			currentCell: 1,
    			inCurrentLine: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CellBox",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cellContent*/ ctx[0] === undefined && !("cellContent" in props)) {
    			console.warn("<CellBox> was created without expected prop 'cellContent'");
    		}

    		if (/*currentCell*/ ctx[1] === undefined && !("currentCell" in props)) {
    			console.warn("<CellBox> was created without expected prop 'currentCell'");
    		}

    		if (/*inCurrentLine*/ ctx[2] === undefined && !("inCurrentLine" in props)) {
    			console.warn("<CellBox> was created without expected prop 'inCurrentLine'");
    		}
    	}

    	get cellContent() {
    		throw new Error("<CellBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellContent(value) {
    		throw new Error("<CellBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentCell() {
    		throw new Error("<CellBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentCell(value) {
    		throw new Error("<CellBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inCurrentLine() {
    		throw new Error("<CellBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inCurrentLine(value) {
    		throw new Error("<CellBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let storage = window.localStorage;
    const getGrid = () => {
        let unparsedGrid = storage.getItem('grid');
        return JSON.parse(unparsedGrid);
    };
    const setGrid = (grid) => {
        storage.setItem('grid', JSON.stringify(grid));
    };
    const getClues = () => {
        let unparsedClues = storage.getItem('clues');
        return JSON.parse(unparsedClues);
    };
    const setClues = (clues) => {
        storage.setItem('clues', JSON.stringify(clues));
    };
    const getAll = () => {
        return {
            grid: getGrid(),
            clues: getClues()
        };
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const foundItems = getAll();
    const foundGrid = foundItems.grid;
    const foundClues = foundItems.clues;
    // The size of a standard NYT puzzle.
    const SIZE = 15;
    const grid = writable(foundGrid ||
        Array.from({ length: SIZE * SIZE }, () => ({
            letter: "",
            isBlackSquare: false,
            number: "",
        })));
    const currentCell = writable(0);
    const currentLine = writable([]);
    // Clues will be an object of objects. Each key in the parent object
    // will contain the type of clue it is, (across or down).
    // The children objects will contain k:v pairs that are of the format:
    // number (int) : clue (string)
    const clues = writable(foundClues ||
        {
            across: {},
            down: {}
        });

    /* src/components/Grid.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1$3, console: console_1$2 } = globals;
    const file$7 = "src/components/Grid.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (193:4) {#each $grid as cellContent, i}
    function create_each_block$2(ctx) {
    	let div;
    	let cellbox;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	cellbox = new CellBox({
    			props: {
    				cellContent: /*cellContent*/ ctx[23],
    				currentCell: /*$currentCell*/ ctx[2] === /*i*/ ctx[25],
    				inCurrentLine: /*$currentLine*/ ctx[3].includes(/*i*/ ctx[25])
    			},
    			$$inline: true
    		});

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[7](/*i*/ ctx[25]);
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[9](/*i*/ ctx[25]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(cellbox.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "cell svelte-19mw5ic");
    			add_location(div, file$7, 193, 8, 5935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(cellbox, div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cellbox_changes = {};
    			if (dirty & /*$grid*/ 2) cellbox_changes.cellContent = /*cellContent*/ ctx[23];
    			if (dirty & /*$currentCell*/ 4) cellbox_changes.currentCell = /*$currentCell*/ ctx[2] === /*i*/ ctx[25];
    			if (dirty & /*$currentLine*/ 8) cellbox_changes.inCurrentLine = /*$currentLine*/ ctx[3].includes(/*i*/ ctx[25]);
    			cellbox.$set(cellbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cellbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cellbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(cellbox);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(193:4) {#each $grid as cellContent, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$grid*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "grid svelte-19mw5ic");
    			add_location(div, file$7, 187, 0, 5780);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", /*mousedown_handler_1*/ ctx[10], false, false, false),
    					listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleClick, handleKeyDown, handleMouseOver, $grid, $currentCell, $currentLine*/ 126) {
    				each_value = /*$grid*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $grid;
    	let $currentCell;
    	let $currentLine;
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(1, $grid = $$value));
    	validate_store(currentCell, "currentCell");
    	component_subscribe($$self, currentCell, $$value => $$invalidate(2, $currentCell = $$value));
    	validate_store(currentLine, "currentLine");
    	component_subscribe($$self, currentLine, $$value => $$invalidate(3, $currentLine = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	

    	// acrossAxis is a boolean to determine current writing direction
    	let acrossAxis = true;

    	let deleteMode = false;
    	let mouseDown = false;

    	// Grid update functions ////////////////////////////////////////
    	const updateGridCell = (cellNumber, cellProps) => {
    		grid.update(() => {
    			let tempGrid = $grid;

    			tempGrid.splice(cellNumber, 1, {
    				letter: cellProps.letter !== null
    				? cellProps.letter
    				: tempGrid[cellNumber].letter,
    				isBlackSquare: cellProps.isBlackSquare !== null
    				? cellProps.isBlackSquare
    				: tempGrid[cellNumber].isBlackSquare,
    				number: cellProps.number !== null
    				? cellProps.number
    				: tempGrid[cellNumber].number
    			});

    			return tempGrid;
    		});
    	};

    	const changeCellFill = cellNumber => {
    		const cellIsBlack = $grid[cellNumber].isBlackSquare;

    		const newData = {
    			letter: "",
    			number: "",
    			isBlackSquare: !cellIsBlack
    		};

    		updateGridCell(cellNumber, newData);
    		updateGridCell($grid.length - 1 - cellNumber, newData);
    		currentLine.set(determineCurrentLine());
    		setGrid($grid);
    	};

    	const determineCurrentLine = () => {
    		const getRow = cellNumber => Math.floor(cellNumber / SIZE);
    		const getCol = cellNumber => cellNumber % SIZE;
    		const inc = acrossAxis ? 1 : SIZE;
    		let min;
    		let max;

    		for (let i = 0; i < SIZE * inc; i += inc) {
    			if (min == undefined) {
    				// Min boundary conditions
    				if (acrossAxis
    				? getCol($currentCell - i) === 0
    				: getRow($currentCell - i) === 0) min = $currentCell - i; else if ($grid[$currentCell - i].isBlackSquare) min = $currentCell - i;
    			}

    			if (max == undefined) {
    				// Max boundary conditions
    				if (acrossAxis
    				? getCol($currentCell + i) === SIZE - 1
    				: getRow($currentCell + i) === SIZE - 1) {
    					max = $currentCell + i;
    				} else if ($grid[$currentCell + i].isBlackSquare) {
    					max = $currentCell + i;
    				}
    			}
    		}

    		let potentialLine = [];

    		for (let i = min; i <= max; i += inc) {
    			potentialLine = potentialLine.concat(i);
    		}

    		return potentialLine;
    	};

    	const setCurrentCell = cellNumber => {
    		currentCell.set(mod(cellNumber, SIZE * SIZE));
    		currentLine.set(determineCurrentLine());
    	};

    	const flipAxis = e => {
    		e.preventDefault(); // Needed to remain on current input element
    		acrossAxis = !acrossAxis;
    	};

    	// moveRight: move(0,1), moveLeft: move(0,-1), moveUp: move(0,-SIZE), moveDown: move(0,SIZE)
    	const move = (acc, inc) => {
    		if ($grid[mod($currentCell + acc + inc, SIZE * SIZE)].isBlackSquare) {
    			move(acc + inc, inc);
    		} else if ($currentCell + acc + inc <= 0) {
    			setCurrentCell(0);
    		} else {
    			setCurrentCell($currentCell + acc + inc);
    		}
    	};

    	// Event handling functions ////////////////////////////////////////
    	const handleClick = cellNumber => {
    		setCurrentCell(cellNumber);

    		setTimeout(
    			function () {
    				if (mouseDown) {
    					changeCellFill(cellNumber);
    				}
    			},
    			200
    		);
    	};

    	const handleArrow = direction => {
    		const L_ARROW = 37;
    		const U_ARROW = 38;
    		const R_ARROW = 39;
    		const D_ARROW = 40;

    		switch (direction) {
    			case L_ARROW:
    				move(0, -1);
    				break;
    			case U_ARROW:
    				move(0, -SIZE);
    				break;
    			case R_ARROW:
    				move(0, 1);
    				break;
    			case D_ARROW:
    				move(0, SIZE);
    				break;
    			default:
    				console.log("ERROR, keycode not recognized:", direction);
    				break;
    		}
    	};

    	const handleBackSpace = () => {
    		if (deleteMode) {
    			updateGridCell($currentCell, Object.assign(Object.assign({}, $grid[$currentCell]), { letter: "" }));
    			move(0, acrossAxis ? -1 : -SIZE);
    		} else if ($grid[$currentCell].letter) {
    			updateGridCell($currentCell, Object.assign(Object.assign({}, $grid[$currentCell]), { letter: "" }));
    		} else move(0, acrossAxis ? -1 : -SIZE);

    		deleteMode = true;
    		setGrid($grid);
    	};

    	const handleKeyDown = event => {
    		if ($grid[$currentCell].isBlackSquare) {
    			acrossAxis ? move(0, 1) : move(0, SIZE);
    		}

    		const A_CODE = 65;
    		const Z_CODE = 90;
    		const B_SPACE = 8;
    		const L_ARROW = 37;
    		const D_ARROW = 40;
    		const TAB = 9;
    		const SPACE = 32;
    		const key = event.keyCode;

    		if (key >= A_CODE && key <= Z_CODE) {
    			deleteMode = false;
    			updateGridCell($currentCell, Object.assign(Object.assign({}, $grid[$currentCell]), { letter: event.key }));
    			move(0, acrossAxis ? 1 : SIZE);
    			setGrid($grid);
    		} else if (key === B_SPACE) {
    			handleBackSpace();
    		} else if (key >= L_ARROW && key <= D_ARROW) {
    			deleteMode = false;
    			handleArrow(key);
    		} else if (key === TAB) {
    			// Switch directionality
    			deleteMode = false;

    			flipAxis(event);
    			currentLine.set(determineCurrentLine());
    		} else if (key === SPACE) {
    			deleteMode = false;
    			changeCellFill($currentCell);
    			move(0, acrossAxis ? 1 : SIZE);
    		}
    	};

    	const handleMouseOver = cellNumber => {
    		if (mouseDown) {
    			changeCellFill(cellNumber);
    		}
    	};

    	// Helper functions
    	const mod = (m, n) => {
    		return (m % n + n) % n;
    	};

    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = i => handleClick(i);
    	const keydown_handler = e => handleKeyDown(e);
    	const mouseover_handler = i => handleMouseOver(i);
    	const mousedown_handler_1 = () => $$invalidate(0, mouseDown = true);
    	const mouseup_handler = () => $$invalidate(0, mouseDown = false);

    	$$self.$capture_state = () => ({
    		CellBox,
    		setGrid,
    		grid,
    		currentCell,
    		currentLine,
    		SIZE,
    		acrossAxis,
    		deleteMode,
    		mouseDown,
    		updateGridCell,
    		changeCellFill,
    		determineCurrentLine,
    		setCurrentCell,
    		flipAxis,
    		move,
    		handleClick,
    		handleArrow,
    		handleBackSpace,
    		handleKeyDown,
    		handleMouseOver,
    		mod,
    		$grid,
    		$currentCell,
    		$currentLine
    	});

    	$$self.$inject_state = $$props => {
    		if ("acrossAxis" in $$props) acrossAxis = $$props.acrossAxis;
    		if ("deleteMode" in $$props) deleteMode = $$props.deleteMode;
    		if ("mouseDown" in $$props) $$invalidate(0, mouseDown = $$props.mouseDown);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		mouseDown,
    		$grid,
    		$currentCell,
    		$currentLine,
    		handleClick,
    		handleKeyDown,
    		handleMouseOver,
    		mousedown_handler,
    		keydown_handler,
    		mouseover_handler,
    		mousedown_handler_1,
    		mouseup_handler
    	];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Buttons.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1$2, console: console_1$1 } = globals;
    const file$6 = "src/components/Buttons.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Export";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Generate Numbers";
    			add_location(button0, file$6, 91, 4, 2724);
    			add_location(button1, file$6, 92, 4, 2780);
    			attr_dev(div, "class", "container svelte-oq1flo");
    			add_location(div, file$6, 90, 0, 2696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $grid;
    	let $clues;
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(4, $grid = $$value));
    	validate_store(clues, "clues");
    	component_subscribe($$self, clues, $$value => $$invalidate(5, $clues = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Buttons", slots, []);
    	

    	const onExport = () => {
    		console.log("Exporting...");
    	};

    	const updateGridCell = (cellNumber, cellProps) => {
    		grid.update(() => {
    			let tempGrid = $grid;

    			tempGrid.splice(cellNumber, 1, {
    				letter: cellProps.letter !== null
    				? cellProps.letter
    				: tempGrid[cellNumber].letter,
    				isBlackSquare: cellProps.isBlackSquare !== null
    				? cellProps.isBlackSquare
    				: tempGrid[cellNumber].isBlackSquare,
    				number: cellProps.number !== null
    				? cellProps.number
    				: tempGrid[cellNumber].number
    			});

    			return tempGrid;
    		});
    	};

    	const cellGetsNumber = cellNumber => {
    		if ($grid[cellNumber].letter == "") {
    			return false;
    		} else if (// Check if across
    		cellNumber % SIZE == 0 || $grid[cellNumber - 1].isBlackSquare) {
    			return true;
    		} else if (// Check if down
    		cellNumber - SIZE < 0 || $grid[cellNumber - SIZE].isBlackSquare) {
    			return true;
    		}
    	};

    	// This function should only be called after ensuring that the cell gets
    	// a number
    	const createClue = cellNumber => {
    		// First find whether the tile should be across, down, or both
    		let across = false;

    		let down = false;

    		// If the grid is a black square, no clue needed.
    		if ($grid[cellNumber].isBlackSquare) {
    			return;
    		} else {
    			// Check across
    			if (cellNumber % SIZE == 0 || $grid[cellNumber - 1].isBlackSquare) {
    				across = true;
    			}

    			// Check down
    			if (cellNumber - SIZE < 0 || $grid[cellNumber - SIZE].isBlackSquare) {
    				down = true;
    			}
    		}

    		// Update $clues accordingly: if across or down, add that number to
    		// the object and create a blank string as the clue.
    		clues.update(() => {
    			let tempClues = $clues;
    			let clueNumber = $grid[cellNumber].number;

    			if (across) {
    				tempClues.across[clueNumber] = "";
    			}

    			if (down) {
    				tempClues.down[clueNumber] = "";
    			}

    			return tempClues;
    		});
    	};

    	const onGenerateNumbers = () => {
    		let currentNumber = 1;

    		for (let i = 0; i < $grid.length; ++i) {
    			if (cellGetsNumber(i)) {
    				const newData = Object.assign(Object.assign({}, $grid[i]), { number: currentNumber });
    				updateGridCell(i, newData);
    				createClue(i);
    				currentNumber += 1;
    			}
    		}

    		setClues($clues);
    		setGrid($grid);
    	};

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onExport();
    	const click_handler_1 = () => onGenerateNumbers();

    	$$self.$capture_state = () => ({
    		grid,
    		clues,
    		SIZE,
    		setGrid,
    		setClues,
    		onExport,
    		updateGridCell,
    		cellGetsNumber,
    		createClue,
    		onGenerateNumbers,
    		$grid,
    		$clues
    	});

    	return [onExport, onGenerateNumbers, click_handler, click_handler_1];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.35.0 */
    const file$5 = "src/components/Navbar.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let h4;
    	let t3;
    	let buttons;
    	let current;
    	buttons = new Buttons({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Crossword Maker";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "By Eli Turner";
    			t3 = space();
    			create_component(buttons.$$.fragment);
    			attr_dev(h1, "class", "svelte-sdufk");
    			add_location(h1, file$5, 5, 8, 137);
    			attr_dev(h4, "class", "svelte-sdufk");
    			add_location(h4, file$5, 6, 8, 170);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$5, 4, 4, 109);
    			attr_dev(div1, "class", "container svelte-sdufk");
    			add_location(div1, file$5, 3, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(div1, t3);
    			mount_component(buttons, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(buttons);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Buttons });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    const baseUrl = 'https://api.datamuse.com/words?sp=';
    const generateSearchString = (cellArr) => {
        let searchStr = baseUrl;
        cellArr.forEach(cell => {
            if (cell.letter) {
                searchStr += cell.letter;
            }
            else {
                searchStr += '?';
            }
        });
        return (searchStr + '&md=d');
    };
    const getWordOptions = async (cellArr) => {
        try {
            const res = await axios.get(generateSearchString(cellArr));
            return res.data.filter(word => word.defs);
        }
        catch (err) {
            console.error(err);
        }
    };

    /* src/components/WordOption.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1$1, console: console_1 } = globals;
    const file$4 = "src/components/WordOption.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let p0;
    	let strong;
    	let t0_value = /*wordOption*/ ctx[0].word + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;
    	let button0;
    	let t4;
    	let button0_disabled_value;
    	let t5;
    	let button1;
    	let t6;
    	let button1_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(/*currentDef*/ ctx[2]);
    			t3 = space();
    			button0 = element("button");
    			t4 = text("<");
    			t5 = space();
    			button1 = element("button");
    			t6 = text(">");
    			add_location(strong, file$4, 69, 7, 2466);
    			add_location(p0, file$4, 69, 4, 2463);
    			add_location(p1, file$4, 70, 4, 2509);
    			button0.disabled = button0_disabled_value = /*definitionNum*/ ctx[1] == 0;
    			add_location(button0, file$4, 71, 4, 2533);
    			button1.disabled = button1_disabled_value = /*definitionNum*/ ctx[1] >= /*wordOption*/ ctx[0].defs.length - 1;
    			add_location(button1, file$4, 74, 4, 2642);
    			attr_dev(div, "class", "word svelte-1s9nr22");
    			add_location(div, file$4, 68, 0, 2396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, strong);
    			append_dev(strong, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(div, t3);
    			append_dev(div, button0);
    			append_dev(button0, t4);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(button1, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(div, "dblclick", /*dblclick_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*wordOption*/ 1 && t0_value !== (t0_value = /*wordOption*/ ctx[0].word + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*currentDef*/ 4) set_data_dev(t2, /*currentDef*/ ctx[2]);

    			if (dirty & /*definitionNum*/ 2 && button0_disabled_value !== (button0_disabled_value = /*definitionNum*/ ctx[1] == 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*definitionNum, wordOption*/ 3 && button1_disabled_value !== (button1_disabled_value = /*definitionNum*/ ctx[1] >= /*wordOption*/ ctx[0].defs.length - 1)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let currentDef;
    	let $grid;
    	let $currentLine;
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(8, $grid = $$value));
    	validate_store(currentLine, "currentLine");
    	component_subscribe($$self, currentLine, $$value => $$invalidate(9, $currentLine = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WordOption", slots, []);
    	
    	let { wordOption } = $$props;
    	let definitionNum = 0;

    	const formatDefinition = definition => {
    		if (definition) {
    			const NOUN = "n";
    			const VERB = "v";
    			const ADJECTIVE = "adj";
    			const ADVERB = "adv";
    			const defBeginning = definition.indexOf("\t");
    			const type = definition.slice(0, defBeginning);

    			switch (type) {
    				case NOUN:
    					return `\n Noun: ${definition.slice(defBeginning)}`;
    				case VERB:
    					return `\n Verb: ${definition.slice(defBeginning)}`;
    				case ADJECTIVE:
    					return `\n Adjective: ${definition.slice(defBeginning)}`;
    				case ADVERB:
    					return `\n Adverb: ${definition.slice(defBeginning)}`;
    				default:
    					console.error("Can't find word type");
    					return;
    			}
    		}
    	};

    	/*
    This next function is broken into two parts to deal
    with black squares being treated as writeable
    */
    	const setGridLine = wordOption => {
    		const letters = wordOption.word;

    		if ($grid[$currentLine[0]].isBlackSquare) {
    			for (let i = 1; i <= letters.length; i++) {
    				updateGridCell($currentLine[i], Object.assign(Object.assign({}, $grid[$currentLine[i]]), { letter: letters[i - 1] }));
    			}
    		} else {
    			for (let i = 0; i < letters.length; i++) {
    				updateGridCell($currentLine[i], Object.assign(Object.assign({}, $grid[$currentLine[i]]), { letter: letters[i] }));
    			}
    		}
    	};

    	const updateCurrentDef = change => {
    		$$invalidate(2, currentDef = wordOption.defs[definitionNum + change]);
    		$$invalidate(1, definitionNum += change);
    	};

    	const updateGridCell = (cellNumber, cellProps) => {
    		grid.update(() => {
    			let tempGrid = $grid;

    			tempGrid.splice(cellNumber, 1, {
    				letter: cellProps.letter !== null
    				? cellProps.letter
    				: tempGrid[cellNumber].letter,
    				isBlackSquare: cellProps.isBlackSquare !== null
    				? cellProps.isBlackSquare
    				: tempGrid[cellNumber].isBlackSquare,
    				number: cellProps.number !== null
    				? cellProps.number
    				: tempGrid[cellNumber].number
    			});

    			return tempGrid;
    		});
    	};

    	const writable_props = ["wordOption"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<WordOption> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => updateCurrentDef(-1);
    	const click_handler_1 = () => updateCurrentDef(1);
    	const dblclick_handler = () => setGridLine(wordOption);

    	$$self.$$set = $$props => {
    		if ("wordOption" in $$props) $$invalidate(0, wordOption = $$props.wordOption);
    	};

    	$$self.$capture_state = () => ({
    		currentLine,
    		grid,
    		currentCell,
    		wordOption,
    		definitionNum,
    		formatDefinition,
    		setGridLine,
    		updateCurrentDef,
    		updateGridCell,
    		currentDef,
    		$grid,
    		$currentLine
    	});

    	$$self.$inject_state = $$props => {
    		if ("wordOption" in $$props) $$invalidate(0, wordOption = $$props.wordOption);
    		if ("definitionNum" in $$props) $$invalidate(1, definitionNum = $$props.definitionNum);
    		if ("currentDef" in $$props) $$invalidate(2, currentDef = $$props.currentDef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wordOption, definitionNum*/ 3) {
    			$$invalidate(2, currentDef = formatDefinition(wordOption.defs[definitionNum]));
    		}
    	};

    	return [
    		wordOption,
    		definitionNum,
    		currentDef,
    		setGridLine,
    		updateCurrentDef,
    		click_handler,
    		click_handler_1,
    		dblclick_handler
    	];
    }

    class WordOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { wordOption: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WordOption",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*wordOption*/ ctx[0] === undefined && !("wordOption" in props)) {
    			console_1.warn("<WordOption> was created without expected prop 'wordOption'");
    		}
    	}

    	get wordOption() {
    		throw new Error("<WordOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordOption(value) {
    		throw new Error("<WordOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Sidebar.svelte generated by Svelte v3.35.0 */
    const file$3 = "src/components/Sidebar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (34:4) {#if wordOptions}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*wordOptions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "word-container svelte-vfpa54");
    			add_location(div, file$3, 34, 8, 1515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wordOptions*/ 1) {
    				each_value = /*wordOptions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:4) {#if wordOptions}",
    		ctx
    	});

    	return block;
    }

    // (36:12) {#each wordOptions as wordOption}
    function create_each_block$1(ctx) {
    	let wordoption;
    	let current;

    	wordoption = new WordOption({
    			props: { wordOption: /*wordOption*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(wordoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wordoption, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wordoption_changes = {};
    			if (dirty & /*wordOptions*/ 1) wordoption_changes.wordOption = /*wordOption*/ ctx[7];
    			wordoption.$set(wordoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wordoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wordoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wordoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:12) {#each wordOptions as wordOption}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let button;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*wordOptions*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Show me some words!";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "id", "big-button");
    			add_location(button, file$3, 30, 4, 1387);
    			attr_dev(div, "class", "container svelte-vfpa54");
    			add_location(div, file$3, 29, 0, 1359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*wordOptions*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*wordOptions*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $currentLine;
    	let $grid;
    	validate_store(currentLine, "currentLine");
    	component_subscribe($$self, currentLine, $$value => $$invalidate(3, $currentLine = $$value));
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(4, $grid = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let wordOptions;

    	const getCurrentLineLetters = () => {
    		let letterArr = [];

    		$currentLine.forEach(cellNumber => {
    			if (!$grid[cellNumber].isBlackSquare) {
    				letterArr.push($grid[cellNumber]);
    			}
    		});

    		return letterArr;
    	};

    	const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
    		const newWordOptions = yield getWordOptions(getCurrentLineLetters());
    		$$invalidate(0, wordOptions = newWordOptions);
    		currentCell.set(-1);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick();

    	$$self.$capture_state = () => ({
    		__awaiter,
    		currentLine,
    		grid,
    		currentCell,
    		getWordOptions,
    		WordOption,
    		wordOptions,
    		getCurrentLineLetters,
    		handleClick,
    		$currentLine,
    		$grid
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("wordOptions" in $$props) $$invalidate(0, wordOptions = $$props.wordOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wordOptions, handleClick, click_handler];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Subheader.svelte generated by Svelte v3.35.0 */
    const file$2 = "src/components/Subheader.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let checkbox;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "How to Use";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Check Rules";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Clear";
    			t5 = space();
    			checkbox = element("checkbox");
    			add_location(button0, file$2, 21, 8, 561);
    			add_location(button1, file$2, 22, 8, 597);
    			add_location(button2, file$2, 23, 8, 634);
    			add_location(checkbox, file$2, 24, 8, 696);
    			attr_dev(div0, "class", "float-right svelte-17fmqp5");
    			add_location(div0, file$2, 20, 4, 527);
    			attr_dev(div1, "class", "container svelte-17fmqp5");
    			add_location(div1, file$2, 19, 0, 499);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			append_dev(div0, t3);
    			append_dev(div0, button2);
    			append_dev(div0, t5);
    			append_dev(div0, checkbox);

    			if (!mounted) {
    				dispose = listen_dev(button2, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $grid;
    	let $clues;
    	validate_store(grid, "grid");
    	component_subscribe($$self, grid, $$value => $$invalidate(2, $grid = $$value));
    	validate_store(clues, "clues");
    	component_subscribe($$self, clues, $$value => $$invalidate(3, $clues = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Subheader", slots, []);

    	const handleClear = () => {
    		grid.set(Array.from({ length: SIZE * SIZE }, () => ({
    			letter: "",
    			isBlackSquare: false,
    			number: ""
    		})));

    		clues.set({ across: {}, down: {} });
    		currentCell.set(null);
    		currentLine.set([]);
    		setGrid($grid);
    		setClues($clues);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Subheader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClear();

    	$$self.$capture_state = () => ({
    		currentLine,
    		grid,
    		currentCell,
    		clues,
    		SIZE,
    		setGrid,
    		setClues,
    		handleClear,
    		$grid,
    		$clues
    	});

    	return [handleClear, click_handler];
    }

    class Subheader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subheader",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ClueBox.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/ClueBox.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:8) {#each Object.keys($clues.across) as clueNum}
    function create_each_block_1(ctx) {
    	let div;
    	let label;
    	let t0_value = /*clueNum*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let input_placeholder_value;
    	let input_value_value;
    	let t3;
    	let mounted;
    	let dispose;

    	function keyup_handler(...args) {
    		return /*keyup_handler*/ ctx[2](/*clueNum*/ ctx[4], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			attr_dev(label, "for", "clueNum");
    			attr_dev(label, "class", "svelte-pcwfjp");
    			add_location(label, file$1, 19, 16, 550);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "clueNum");
    			attr_dev(input, "placeholder", input_placeholder_value = "Clue for " + /*clueNum*/ ctx[4] + " across");
    			attr_dev(input, "class", "clue svelte-pcwfjp");
    			input.value = input_value_value = /*$clues*/ ctx[0].across[/*clueNum*/ ctx[4]];
    			add_location(input, file$1, 20, 16, 606);
    			add_location(div, file$1, 18, 12, 528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "keyup", keyup_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$clues*/ 1 && t0_value !== (t0_value = /*clueNum*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$clues*/ 1 && input_placeholder_value !== (input_placeholder_value = "Clue for " + /*clueNum*/ ctx[4] + " across")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*$clues*/ 1 && input_value_value !== (input_value_value = /*$clues*/ ctx[0].across[/*clueNum*/ ctx[4]]) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(18:8) {#each Object.keys($clues.across) as clueNum}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#each Object.keys($clues.down) as clueNum}
    function create_each_block(ctx) {
    	let div;
    	let label;
    	let t0_value = /*clueNum*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let input_placeholder_value;
    	let t3;
    	let mounted;
    	let dispose;

    	function keyup_handler_1(...args) {
    		return /*keyup_handler_1*/ ctx[3](/*clueNum*/ ctx[4], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			attr_dev(label, "for", "clueNum");
    			attr_dev(label, "class", "svelte-pcwfjp");
    			add_location(label, file$1, 35, 16, 1097);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "clueNum");
    			attr_dev(input, "placeholder", input_placeholder_value = "Clue for " + /*clueNum*/ ctx[4] + " down");
    			attr_dev(input, "class", "clue svelte-pcwfjp");
    			add_location(input, file$1, 36, 16, 1153);
    			add_location(div, file$1, 34, 12, 1075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "keyup", keyup_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$clues*/ 1 && t0_value !== (t0_value = /*clueNum*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$clues*/ 1 && input_placeholder_value !== (input_placeholder_value = "Clue for " + /*clueNum*/ ctx[4] + " down")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:8) {#each Object.keys($clues.down) as clueNum}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let h50;
    	let t1;
    	let t2;
    	let div1;
    	let h51;
    	let t4;
    	let each_value_1 = Object.keys(/*$clues*/ ctx[0].across);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Object.keys(/*$clues*/ ctx[0].down);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Across";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Down";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h50, "class", "svelte-pcwfjp");
    			add_location(h50, file$1, 16, 8, 446);
    			attr_dev(div0, "class", "clues svelte-pcwfjp");
    			add_location(div0, file$1, 15, 4, 418);
    			attr_dev(h51, "class", "svelte-pcwfjp");
    			add_location(h51, file$1, 32, 8, 997);
    			attr_dev(div1, "class", "clues svelte-pcwfjp");
    			add_location(div1, file$1, 31, 4, 969);
    			attr_dev(div2, "class", "clueContainer svelte-pcwfjp");
    			add_location(div2, file$1, 14, 0, 386);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h50);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h51);
    			append_dev(div1, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, $clues, saveClues*/ 3) {
    				each_value_1 = Object.keys(/*$clues*/ ctx[0].across);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*Object, $clues, saveClues*/ 3) {
    				each_value = Object.keys(/*$clues*/ ctx[0].down);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $clues;
    	validate_store(clues, "clues");
    	component_subscribe($$self, clues, $$value => $$invalidate(0, $clues = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClueBox", slots, []);
    	

    	const saveClues = (event, direction, number) => {
    		let newClue = event.target.value;

    		clues.update(() => {
    			let tempClues = $clues;
    			tempClues[direction][number] = newClue;
    			return tempClues;
    		});

    		setClues($clues);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClueBox> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = (clueNum, event) => saveClues(event, "across", clueNum);
    	const keyup_handler_1 = (clueNum, event) => saveClues(event, "down", clueNum);
    	$$self.$capture_state = () => ({ clues, grid, setClues, saveClues, $clues });
    	return [$clues, saveClues, keyup_handler, keyup_handler_1];
    }

    class ClueBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClueBox",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let subheader;
    	let t1;
    	let div;
    	let grid;
    	let t2;
    	let sidebar;
    	let t3;
    	let cluebox;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	subheader = new Subheader({ $$inline: true });
    	grid = new Grid({ $$inline: true });
    	sidebar = new Sidebar({ $$inline: true });
    	cluebox = new ClueBox({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(subheader.$$.fragment);
    			t1 = space();
    			div = element("div");
    			create_component(grid.$$.fragment);
    			t2 = space();
    			create_component(sidebar.$$.fragment);
    			t3 = space();
    			create_component(cluebox.$$.fragment);
    			attr_dev(div, "class", "container svelte-8w5mel");
    			add_location(div, file, 19, 4, 573);
    			add_location(main, file, 16, 0, 529);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(subheader, main, null);
    			append_dev(main, t1);
    			append_dev(main, div);
    			mount_component(grid, div, null);
    			append_dev(div, t2);
    			mount_component(sidebar, div, null);
    			append_dev(main, t3);
    			mount_component(cluebox, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(subheader.$$.fragment, local);
    			transition_in(grid.$$.fragment, local);
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(cluebox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(subheader.$$.fragment, local);
    			transition_out(grid.$$.fragment, local);
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(cluebox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(subheader);
    			destroy_component(grid);
    			destroy_component(sidebar);
    			destroy_component(cluebox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Grid,
    		Navbar,
    		Sidebar,
    		Subheader,
    		ClueBox
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
