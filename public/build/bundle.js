
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
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
        else if (callback) {
            callback();
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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

    let oldPrice = 250;
    let discount = 50;
    let newPrice = oldPrice.toFixed(2)-(oldPrice.toFixed(2)/100*(discount));
    const products = {
        id: 1,
        name:"Fall Limited Edition Sneakers",
        oldPrice: '$'.concat(oldPrice.toFixed(2).toString()),
        price: '$'.concat(newPrice.toFixed(2).toString()),
        priceFloat: newPrice,
        discount: (discount.toString()).concat('%'),
        description: "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they'll withstand everything the weather can offer.",
        images: [
            "images/image-product-1.jpg",
            "images/image-product-2.jpg",
            "images/image-product-3.jpg",
            "images/image-product-4.jpg"
          ]
    };

    /* src\Navbar.svelte generated by Svelte v3.59.2 */
    const file$3 = "src\\Navbar.svelte";

    // (25:3) {#if !desktop}
    function create_if_block_5(ctx) {
    	let a;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M16 12v3H0v-3h16Zm0-6v3H0V6h16Zm0-6v3H0V0h16Z");
    			attr_dev(path, "fill", "#69707D");
    			attr_dev(path, "fill-rule", "evenodd");
    			add_location(path, file$3, 26, 67, 710);
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "15");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$3, 26, 4, 647);
    			add_location(a, file$3, 25, 3, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*menuToggle*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(25:3) {#if !desktop}",
    		ctx
    	});

    	return block;
    }

    // (38:5) {#if !desktop}
    function create_if_block_4(ctx) {
    	let li;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "m11.596.782 2.122 2.122L9.12 7.499l4.597 4.597-2.122 2.122L7 9.62l-4.595 4.597-2.122-2.122L4.878 7.5.282 2.904 2.404.782l4.595 4.596L11.596.782Z");
    			attr_dev(path, "fill", "#69707D");
    			attr_dev(path, "fill-rule", "evenodd");
    			add_location(path, file$3, 40, 69, 3844);
    			attr_dev(svg, "width", "14");
    			attr_dev(svg, "height", "15");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$3, 40, 6, 3781);
    			add_location(li, file$3, 39, 5, 3747);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*menuToggle*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(38:5) {#if !desktop}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if cartItems>=1}
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*cartItems*/ ctx[1]);
    			attr_dev(div0, "class", "items-cart-count-num svelte-ch5nlt");
    			add_location(div0, file$3, 61, 5, 4824);
    			attr_dev(div1, "class", "items-cart-count-bg svelte-ch5nlt");
    			add_location(div1, file$3, 60, 4, 4784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartItems*/ 2) set_data_dev(t, /*cartItems*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(60:4) {#if cartItems>=1}",
    		ctx
    	});

    	return block;
    }

    // (84:2) {:else}
    function create_else_block(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t3_value = products.price + "";
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let span;
    	let t7;
    	let t8_value = (products.priceFloat * /*cartItems*/ ctx[1]).toFixed(2) + "";
    	let t8;
    	let t9;
    	let div1;
    	let svg;
    	let defs;
    	let path;
    	let use;
    	let t10;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = `${products.name}`;
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = text(" x ");
    			t5 = text(/*cartItems*/ ctx[1]);
    			t6 = space();
    			span = element("span");
    			t7 = text("$");
    			t8 = text(t8_value);
    			t9 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			path = svg_element("path");
    			use = svg_element("use");
    			t10 = space();
    			button = element("button");
    			button.textContent = "Checkout";
    			if (!src_url_equal(img.src, img_src_value = products.images[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "product preview");
    			attr_dev(img, "class", "svelte-ch5nlt");
    			add_location(img, file$3, 86, 6, 6279);
    			attr_dev(p0, "class", "svelte-ch5nlt");
    			add_location(p0, file$3, 88, 7, 6381);
    			attr_dev(span, "class", "sum svelte-ch5nlt");
    			add_location(span, file$3, 89, 41, 6446);
    			attr_dev(p1, "class", "svelte-ch5nlt");
    			add_location(p1, file$3, 89, 7, 6412);
    			attr_dev(div0, "class", "name-price-count svelte-ch5nlt");
    			add_location(div0, file$3, 87, 6, 6342);
    			attr_dev(path, "d", "M0 2.625V1.75C0 1.334.334 1 .75 1h3.5l.294-.584A.741.741 0 0 1 5.213 0h3.571a.75.75 0 0 1 .672.416L9.75 1h3.5c.416 0 .75.334.75.75v.875a.376.376 0 0 1-.375.375H.375A.376.376 0 0 1 0 2.625Zm13 1.75V14.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 1 14.5V4.375C1 4.169 1.169 4 1.375 4h11.25c.206 0 .375.169.375.375ZM4.5 6.5c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Zm3 0c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Zm3 0c0-.275-.225-.5-.5-.5s-.5.225-.5.5v7c0 .275.225.5.5.5s.5-.225.5-.5v-7Z");
    			attr_dev(path, "id", "cart-delete-btn");
    			add_location(path, file$3, 92, 119, 6722);
    			add_location(defs, file$3, 92, 113, 6716);
    			attr_dev(use, "fill", "#C3CAD9");
    			attr_dev(use, "fill-rule", "nonzero");
    			xlink_attr(use, "xlink:href", "#cart-delete-btn");
    			add_location(use, file$3, 92, 693, 7296);
    			attr_dev(svg, "width", "14");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg, file$3, 92, 7, 6610);
    			attr_dev(div1, "class", "cart-delete-btn svelte-ch5nlt");
    			add_location(div1, file$3, 91, 6, 6543);
    			attr_dev(div2, "class", "cart-product svelte-ch5nlt");
    			add_location(div2, file$3, 85, 5, 6245);
    			attr_dev(button, "class", "button svelte-ch5nlt");
    			add_location(button, file$3, 95, 5, 7407);
    			attr_dev(div3, "class", "cart-content svelte-ch5nlt");
    			add_location(div3, file$3, 84, 4, 6212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, span);
    			append_dev(span, t7);
    			append_dev(span, t8);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, defs);
    			append_dev(defs, path);
    			append_dev(svg, use);
    			append_dev(div3, t10);
    			append_dev(div3, button);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[7], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartItems*/ 2) set_data_dev(t5, /*cartItems*/ ctx[1]);
    			if (dirty & /*cartItems*/ 2 && t8_value !== (t8_value = (products.priceFloat * /*cartItems*/ ctx[1]).toFixed(2) + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(84:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:2) {#if cartItems<1}
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Your cart is empty";
    			attr_dev(p, "class", "svelte-ch5nlt");
    			add_location(p, file$3, 80, 6, 6145);
    			attr_dev(div0, "class", "empty-cart-text svelte-ch5nlt");
    			add_location(div0, file$3, 79, 5, 6108);
    			attr_dev(div1, "class", "cart-content-empty svelte-ch5nlt");
    			add_location(div1, file$3, 78, 4, 6069);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(78:2) {#if cartItems<1}",
    		ctx
    	});

    	return block;
    }

    // (107:1) {#if !desktop}
    function create_if_block_1$1(ctx) {
    	let div;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "backdrop-close-menu " + (/*menuVisible*/ ctx[0] ? '' : 'hidden') + " svelte-ch5nlt");
    			add_location(div, file$3, 107, 1, 7592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*menuToggle*/ ctx[4], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuVisible*/ 1 && div_class_value !== (div_class_value = "backdrop-close-menu " + (/*menuVisible*/ ctx[0] ? '' : 'hidden') + " svelte-ch5nlt")) {
    				attr_dev(div, "class", div_class_value);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(107:1) {#if !desktop}",
    		ctx
    	});

    	return block;
    }

    // (111:1) {#if desktop}
    function create_if_block$1(ctx) {
    	let div;
    	let hr;

    	const block = {
    		c: function create() {
    			div = element("div");
    			hr = element("hr");
    			attr_dev(hr, "class", "divider svelte-ch5nlt");
    			add_location(hr, file$3, 112, 2, 7721);
    			add_location(div, file$3, 111, 1, 7711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, hr);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(111:1) {#if desktop}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let navbar;
    	let div3;
    	let t0;
    	let div0;
    	let a0;
    	let svg0;
    	let path0;
    	let t1;
    	let div2;
    	let ul;
    	let t2;
    	let div1;
    	let li0;
    	let a1;
    	let t3;
    	let a1_class_value;
    	let t4;
    	let li1;
    	let a2;
    	let t5;
    	let a2_class_value;
    	let t6;
    	let li2;
    	let a3;
    	let t7;
    	let a3_class_value;
    	let t8;
    	let li3;
    	let a4;
    	let t9;
    	let a4_class_value;
    	let t10;
    	let li4;
    	let a5;
    	let t11;
    	let a5_class_value;
    	let div1_class_value;
    	let div2_class_value;
    	let div3_class_value;
    	let t12;
    	let div8;
    	let div4;
    	let t13;
    	let svg1;
    	let path1;
    	let div4_class_value;
    	let t14;
    	let div5;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let t15;
    	let div7;
    	let div6;
    	let t17;
    	let hr;
    	let t18;
    	let div7_class_value;
    	let navbar_class_value;
    	let t19;
    	let t20;
    	let if_block5_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*desktop*/ ctx[2] && create_if_block_5(ctx);
    	let if_block1 = !/*desktop*/ ctx[2] && create_if_block_4(ctx);
    	let if_block2 = /*cartItems*/ ctx[1] >= 1 && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*cartItems*/ ctx[1] < 1) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type(ctx);
    	let if_block4 = !/*desktop*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block5 = /*desktop*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			navbar = element("navbar");
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div2 = element("div");
    			ul = element("ul");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			li0 = element("li");
    			a1 = element("a");
    			t3 = text("Collections");
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t5 = text("Men");
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			t7 = text("Women");
    			t8 = space();
    			li3 = element("li");
    			a4 = element("a");
    			t9 = text("About");
    			t10 = space();
    			li4 = element("li");
    			a5 = element("a");
    			t11 = text("Contact");
    			t12 = space();
    			div8 = element("div");
    			div4 = element("div");
    			if (if_block2) if_block2.c();
    			t13 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t14 = space();
    			div5 = element("div");
    			img = element("img");
    			t15 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Cart";
    			t17 = space();
    			hr = element("hr");
    			t18 = space();
    			if_block3.c();
    			t19 = space();
    			if (if_block4) if_block4.c();
    			t20 = space();
    			if (if_block5) if_block5.c();
    			if_block5_anchor = empty();
    			attr_dev(path0, "d", "M8.217 20c4.761 0 7.519-.753 7.519-4.606 0-3.4-3.38-4.172-6.66-4.682l-.56-.085-.279-.041-.35-.053c-2.7-.405-3.18-.788-3.18-1.471 0-.478.49-1.331 2.843-1.331 2.455 0 3.493.647 3.493 1.87v.134h4.281v-.133c0-2.389-1.35-5.238-7.774-5.238-5.952 0-7.201 2.584-7.201 4.752 0 3.097 2.763 4.086 7.223 4.675.21.028.433.054.659.081 1.669.197 3.172.42 3.172 1.585 0 1.01-1.615 1.222-3.298 1.222-2.797 0-3.784-.593-3.784-1.92v-.134H.002L0 14.926v.317c.008.79.118 1.913 1.057 2.862C2.303 19.362 4.712 20 8.217 20Zm13.21 0v-7.49c0-2.104.547-4.423 4.176-4.423 3.915 0 3.778 2.777 3.768 4.042V20h4.18v-7.768c0-2.264-.176-7.766-6.732-7.766-2.778 0-4.192.911-5.195 2.28h-.197V4.467H17.22V20h4.207Zm21.959 0c5.094 0 7.787-2.07 8.217-5.405H47.53c-.386 1.02-1.63 1.72-4.143 1.72-2.721 0-3.962-1.03-4.25-3.106h12.527c.24-2.13-.029-5.417-3.026-7.44v.005c-1.312-.915-3.056-1.465-5.251-1.465-5.24 0-8.336 2.772-8.336 7.845 0 5.17 3.02 7.846 8.336 7.846Zm4.099-9.574h-8.188c.486-1.574 1.764-2.431 4.089-2.431 2.994 0 3.755 1.267 4.099 2.431ZM70.499 20V4.457H66.29V6.74h-.176c-1.053-1.377-2.809-2.283-5.677-2.283-6.433 0-7.225 5.293-7.253 7.635v.137c0 2.092.732 7.771 7.241 7.771 2.914 0 4.684-.818 5.734-2.169h.131V20H70.5Zm-8.854-3.623c-3.996 0-4.447-3.032-4.447-4.148 0-1.21.426-4.148 4.455-4.148 3.631 0 4.374 2.044 4.374 4.148 0 2.35-.742 4.148-4.382 4.148ZM88.826 20l-6.529-9.045 6.588-6.488h-5.827l-6.836 6.756V0h-4.187v19.954h4.187V16.94l3.02-2.976L83.6 20h5.226Zm9.9 0c5.094 0 7.786-2.07 8.217-5.405h-4.074c-.387 1.02-1.63 1.72-4.143 1.72-2.721 0-3.962-1.03-4.25-3.106h12.527c.24-2.13-.029-5.417-3.026-7.44v.005c-1.312-.915-3.057-1.465-5.251-1.465-5.24 0-8.336 2.772-8.336 7.845 0 5.17 3.02 7.846 8.336 7.846Zm4.098-9.574h-8.187c.485-1.574 1.763-2.431 4.089-2.431 2.994 0 3.755 1.267 4.098 2.431ZM112.76 20v-6.97c0-2.103.931-4.542 4.05-4.542 1.33 0 2.393.236 2.785.346l.67-3.976c-.728-.16-1.626-.392-2.757-.392-2.665 0-3.622.794-4.486 2.282h-.262V4.466h-4.21V20h4.21Zm17.221 0c4.761 0 7.519-.753 7.519-4.606 0-3.4-3.38-4.172-6.66-4.682l-.56-.085-.279-.041-.349-.053c-2.701-.405-3.181-.788-3.181-1.471 0-.478.49-1.331 2.843-1.331 2.455 0 3.493.647 3.493 1.87v.134h4.282v-.133c0-2.389-1.35-5.238-7.775-5.238-5.952 0-7.201 2.584-7.201 4.752 0 3.097 2.763 4.086 7.224 4.675.21.028.432.054.658.081 1.669.197 3.172.42 3.172 1.585 0 1.01-1.615 1.222-3.298 1.222-2.796 0-3.784-.593-3.784-1.92v-.134h-4.319l-.001.301v.317c.008.79.117 1.913 1.056 2.862 1.246 1.257 3.655 1.895 7.16 1.895Z");
    			attr_dev(path0, "fill", "#1D2026");
    			attr_dev(path0, "fill-rule", "nonzero");
    			add_location(path0, file$3, 32, 68, 1016);
    			attr_dev(svg0, "width", "138");
    			attr_dev(svg0, "height", "20");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$3, 32, 4, 952);
    			attr_dev(a0, "href", "index");
    			add_location(a0, file$3, 31, 4, 930);
    			attr_dev(div0, "class", "navbar-brand-logo svelte-ch5nlt");
    			add_location(div0, file$3, 30, 3, 893);
    			attr_dev(a1, "class", a1_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"));
    			attr_dev(a1, "href", "index");
    			add_location(a1, file$3, 44, 10, 4141);
    			add_location(li0, file$3, 44, 6, 4137);
    			attr_dev(a2, "class", a2_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"));
    			attr_dev(a2, "href", "index");
    			add_location(a2, file$3, 45, 10, 4223);
    			add_location(li1, file$3, 45, 6, 4219);
    			attr_dev(a3, "class", a3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"));
    			attr_dev(a3, "href", "index");
    			add_location(a3, file$3, 46, 10, 4297);
    			add_location(li2, file$3, 46, 6, 4293);
    			attr_dev(a4, "class", a4_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"));
    			attr_dev(a4, "href", "index");
    			add_location(a4, file$3, 47, 10, 4373);
    			add_location(li3, file$3, 47, 6, 4369);
    			attr_dev(a5, "class", a5_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"));
    			attr_dev(a5, "href", "index");
    			add_location(a5, file$3, 48, 10, 4449);
    			add_location(li4, file$3, 48, 6, 4445);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-list-desktop' : 'link-list') + " svelte-ch5nlt"));
    			add_location(div1, file$3, 43, 5, 4072);
    			attr_dev(ul, "class", "svelte-ch5nlt");
    			add_location(ul, file$3, 36, 4, 3652);

    			attr_dev(div2, "class", div2_class_value = "" + ((/*desktop*/ ctx[2]
    			? 'navbar-links-desktop'
    			: 'navbar-links') + " " + (/*menuVisible*/ ctx[0] ? '' : 'hidden') + " svelte-ch5nlt"));

    			add_location(div2, file$3, 35, 3, 3554);

    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-left desktop'
    			: 'navbar-left') + " svelte-ch5nlt"));

    			add_location(div3, file$3, 23, 2, 531);
    			attr_dev(path1, "d", "M20.925 3.641H3.863L3.61.816A.896.896 0 0 0 2.717 0H.897a.896.896 0 1 0 0 1.792h1l1.031 11.483c.073.828.52 1.726 1.291 2.336C2.83 17.385 4.099 20 6.359 20c1.875 0 3.197-1.87 2.554-3.642h4.905c-.642 1.77.677 3.642 2.555 3.642a2.72 2.72 0 0 0 2.717-2.717 2.72 2.72 0 0 0-2.717-2.717H6.365c-.681 0-1.274-.41-1.53-1.009l14.321-.842a.896.896 0 0 0 .817-.677l1.821-7.283a.897.897 0 0 0-.87-1.114ZM6.358 18.208a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm10.015 0a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm2.021-7.243-13.8.81-.57-6.341h15.753l-1.383 5.53Z");
    			attr_dev(path1, "fill", "#69707D");
    			attr_dev(path1, "fill-rule", "nonzero");
    			add_location(path1, file$3, 66, 67, 4979);
    			attr_dev(svg1, "width", "22");
    			attr_dev(svg1, "height", "20");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$3, 66, 4, 4916);

    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-cart-desktop'
    			: 'navbar-cart') + " svelte-ch5nlt"));

    			add_location(div4, file$3, 58, 3, 4666);

    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-profile-pic-desktop'
    			: 'navbar-profile-pic') + " svelte-ch5nlt"));

    			if (!src_url_equal(img.src, img_src_value = "images/image-avatar.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "profile pic");
    			add_location(img, file$3, 69, 4, 5610);
    			add_location(div5, file$3, 68, 3, 5598);
    			attr_dev(div6, "class", "cart-header svelte-ch5nlt");
    			add_location(div6, file$3, 75, 4, 5975);
    			attr_dev(hr, "class", "divider cart svelte-ch5nlt");
    			add_location(hr, file$3, 76, 4, 6016);
    			attr_dev(div7, "class", div7_class_value = "" + ((/*desktop*/ ctx[2] ? 'cart-modal desktop' : 'cart-modal') + " " + (/*cartModalVisible*/ ctx[3] ? '' : 'hidden') + " svelte-ch5nlt"));
    			add_location(div7, file$3, 74, 3, 5876);
    			attr_dev(div8, "class", "navbar-right svelte-ch5nlt");
    			add_location(div8, file$3, 56, 2, 4630);
    			attr_dev(navbar, "class", navbar_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'navbar desktop' : 'navbar') + " svelte-ch5nlt"));
    			add_location(navbar, file$3, 20, 1, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, navbar, anchor);
    			append_dev(navbar, div3);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, ul);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t2);
    			append_dev(ul, div1);
    			append_dev(div1, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t5);
    			append_dev(div1, t6);
    			append_dev(div1, li2);
    			append_dev(li2, a3);
    			append_dev(a3, t7);
    			append_dev(div1, t8);
    			append_dev(div1, li3);
    			append_dev(li3, a4);
    			append_dev(a4, t9);
    			append_dev(div1, t10);
    			append_dev(div1, li4);
    			append_dev(li4, a5);
    			append_dev(a5, t11);
    			append_dev(navbar, t12);
    			append_dev(navbar, div8);
    			append_dev(div8, div4);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div4, t13);
    			append_dev(div4, svg1);
    			append_dev(svg1, path1);
    			append_dev(div8, t14);
    			append_dev(div8, div5);
    			append_dev(div5, img);
    			append_dev(div8, t15);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t17);
    			append_dev(div7, hr);
    			append_dev(div7, t18);
    			if_block3.m(div7, null);
    			insert_dev(target, t19, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, if_block5_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*cartModalToggle*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*desktop*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*desktop*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(ul, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*desktop*/ 4 && a1_class_value !== (a1_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"))) {
    				attr_dev(a1, "class", a1_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && a2_class_value !== (a2_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"))) {
    				attr_dev(a2, "class", a2_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && a3_class_value !== (a3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"))) {
    				attr_dev(a3, "class", a3_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && a4_class_value !== (a4_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"))) {
    				attr_dev(a4, "class", a4_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && a5_class_value !== (a5_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-nav' : '') + " svelte-ch5nlt"))) {
    				attr_dev(a5, "class", a5_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'link-list-desktop' : 'link-list') + " svelte-ch5nlt"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*desktop, menuVisible*/ 5 && div2_class_value !== (div2_class_value = "" + ((/*desktop*/ ctx[2]
    			? 'navbar-links-desktop'
    			: 'navbar-links') + " " + (/*menuVisible*/ ctx[0] ? '' : 'hidden') + " svelte-ch5nlt"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-left desktop'
    			: 'navbar-left') + " svelte-ch5nlt"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (/*cartItems*/ ctx[1] >= 1) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(div4, t13);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*desktop*/ 4 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-cart-desktop'
    			: 'navbar-cart') + " svelte-ch5nlt"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && img_class_value !== (img_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'navbar-profile-pic-desktop'
    			: 'navbar-profile-pic') + " svelte-ch5nlt"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div7, null);
    				}
    			}

    			if (dirty & /*desktop, cartModalVisible*/ 12 && div7_class_value !== (div7_class_value = "" + ((/*desktop*/ ctx[2] ? 'cart-modal desktop' : 'cart-modal') + " " + (/*cartModalVisible*/ ctx[3] ? '' : 'hidden') + " svelte-ch5nlt"))) {
    				attr_dev(div7, "class", div7_class_value);
    			}

    			if (dirty & /*desktop*/ 4 && navbar_class_value !== (navbar_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'navbar desktop' : 'navbar') + " svelte-ch5nlt"))) {
    				attr_dev(navbar, "class", navbar_class_value);
    			}

    			if (!/*desktop*/ ctx[2]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$1(ctx);
    					if_block4.c();
    					if_block4.m(t20.parentNode, t20);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*desktop*/ ctx[2]) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block$1(ctx);
    					if_block5.c();
    					if_block5.m(if_block5_anchor.parentNode, if_block5_anchor);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(navbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			if (detaching) detach_dev(t19);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(if_block5_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { menuVisible } = $$props;
    	let { desktop } = $$props;

    	const menuToggle = () => {
    		$$invalidate(0, menuVisible = !menuVisible);
    	};

    	let cartModalVisible = false;

    	const cartModalToggle = () => {
    		$$invalidate(3, cartModalVisible = !cartModalVisible);
    	};

    	let { cartItems } = $$props;

    	const deleteAll = () => {
    		$$invalidate(1, cartItems = 0);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (menuVisible === undefined && !('menuVisible' in $$props || $$self.$$.bound[$$self.$$.props['menuVisible']])) {
    			console.warn("<Navbar> was created without expected prop 'menuVisible'");
    		}

    		if (desktop === undefined && !('desktop' in $$props || $$self.$$.bound[$$self.$$.props['desktop']])) {
    			console.warn("<Navbar> was created without expected prop 'desktop'");
    		}

    		if (cartItems === undefined && !('cartItems' in $$props || $$self.$$.bound[$$self.$$.props['cartItems']])) {
    			console.warn("<Navbar> was created without expected prop 'cartItems'");
    		}
    	});

    	const writable_props = ['menuVisible', 'desktop', 'cartItems'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => deleteAll();

    	$$self.$$set = $$props => {
    		if ('menuVisible' in $$props) $$invalidate(0, menuVisible = $$props.menuVisible);
    		if ('desktop' in $$props) $$invalidate(2, desktop = $$props.desktop);
    		if ('cartItems' in $$props) $$invalidate(1, cartItems = $$props.cartItems);
    	};

    	$$self.$capture_state = () => ({
    		products,
    		menuVisible,
    		desktop,
    		menuToggle,
    		cartModalVisible,
    		cartModalToggle,
    		cartItems,
    		deleteAll
    	});

    	$$self.$inject_state = $$props => {
    		if ('menuVisible' in $$props) $$invalidate(0, menuVisible = $$props.menuVisible);
    		if ('desktop' in $$props) $$invalidate(2, desktop = $$props.desktop);
    		if ('cartModalVisible' in $$props) $$invalidate(3, cartModalVisible = $$props.cartModalVisible);
    		if ('cartItems' in $$props) $$invalidate(1, cartItems = $$props.cartItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		menuVisible,
    		cartItems,
    		desktop,
    		cartModalVisible,
    		menuToggle,
    		cartModalToggle,
    		deleteAll,
    		click_handler
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { menuVisible: 0, desktop: 2, cartItems: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get menuVisible() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuVisible(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desktop() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desktop(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cartItems() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cartItems(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Carousel.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\Carousel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (39:0) {#if desktop}
    function create_if_block_1(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let svg0;
    	let path0;
    	let t0;
    	let div2;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t1;
    	let div1;
    	let button0;
    	let svg1;
    	let path1;
    	let t2;
    	let button1;
    	let svg2;
    	let path2;
    	let t3;
    	let div4;
    	let div3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let div6_class_value;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*images*/ ctx[3];
    	validate_each_argument(each_value_3);
    	const get_key = ctx => /*index*/ ctx[16];
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_2 = /*images*/ ctx[3];
    	validate_each_argument(each_value_2);
    	const get_key_1 = ctx => /*index*/ ctx[16];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_1);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			button1 = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path0, "d", "m11.596.782 2.122 2.122L9.12 7.499l4.597 4.597-2.122 2.122L7 9.62l-4.595 4.597-2.122-2.122L4.878 7.5.282 2.904 2.404.782l4.595 4.596L11.596.782Z");
    			add_location(path0, file$2, 44, 75, 1552);
    			attr_dev(svg0, "class", "close-icon-svg svelte-zz5q6l");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$2, 44, 12, 1489);
    			attr_dev(div0, "class", "close-icon svelte-zz5q6l");
    			add_location(div0, file$2, 43, 8, 1425);
    			attr_dev(path1, "d", "M11 1 3 9l8 8");
    			attr_dev(path1, "stroke-width", "3");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "fill-rule", "evenodd");
    			add_location(path1, file$2, 55, 107, 2350);
    			attr_dev(svg1, "class", "arrow-sign-left svelte-zz5q6l");
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "18");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$2, 55, 20, 2263);
    			attr_dev(button0, "class", "arrow-circle svelte-zz5q6l");
    			add_location(button0, file$2, 54, 16, 2173);
    			attr_dev(path2, "d", "m2 1 8 8-8 8");
    			attr_dev(path2, "stroke-width", "3");
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "fill-rule", "evenodd");
    			add_location(path2, file$2, 58, 108, 2652);
    			attr_dev(svg2, "class", "arrow-sign-right svelte-zz5q6l");
    			attr_dev(svg2, "width", "12");
    			attr_dev(svg2, "height", "18");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$2, 58, 20, 2564);
    			attr_dev(button1, "class", "arrow-circle svelte-zz5q6l");
    			add_location(button1, file$2, 57, 16, 2475);
    			attr_dev(div1, "class", "buttons-desktop svelte-zz5q6l");
    			add_location(div1, file$2, 53, 12, 2126);
    			attr_dev(div2, "class", "modal-img svelte-zz5q6l");
    			add_location(div2, file$2, 46, 8, 1741);
    			attr_dev(div3, "class", "modal-preview-inner svelte-zz5q6l");
    			add_location(div3, file$2, 64, 12, 2853);
    			attr_dev(div4, "class", "modal-preview-outer svelte-zz5q6l");
    			add_location(div4, file$2, 63, 8, 2806);
    			attr_dev(div5, "class", "modal-inner svelte-zz5q6l");
    			add_location(div5, file$2, 41, 4, 1324);
    			attr_dev(div6, "class", div6_class_value = "modal-outer " + (/*imgModalVisible*/ ctx[2] ? '' : 'hidden') + " svelte-zz5q6l");
    			add_location(div6, file$2, 40, 0, 1260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div5, t0);
    			append_dev(div5, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div2, null);
    				}
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, svg1);
    			append_dev(svg1, path1);
    			append_dev(div1, t2);
    			append_dev(div1, button1);
    			append_dev(button1, svg2);
    			append_dev(svg2, path2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div3, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*imgModalToggle*/ ctx[6], false, false, false, false),
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[9], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[10], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*desktop, images, slides*/ 11) {
    				each_value_3 = /*images*/ ctx[3];
    				validate_each_argument(each_value_3);
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_3, each0_lookup, div2, destroy_block, create_each_block_3, t1, get_each_context_3);
    			}

    			if (dirty & /*images, slides, previewClicker*/ 42) {
    				each_value_2 = /*images*/ ctx[3];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value_2, each1_lookup, div3, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty & /*imgModalVisible*/ 4 && div6_class_value !== (div6_class_value = "modal-outer " + (/*imgModalVisible*/ ctx[2] ? '' : 'hidden') + " svelte-zz5q6l")) {
    				attr_dev(div6, "class", div6_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:0) {#if desktop}",
    		ctx
    	});

    	return block;
    }

    // (48:12) {#each images as imageURL, index (index)}
    function create_each_block_3(key_1, ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let li_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*imageURL*/ ctx[14])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `product #${/*index*/ ctx[16] + 1}`);
    			attr_dev(img, "class", "svelte-zz5q6l");
    			add_location(img, file$2, 50, 16, 2021);

    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*desktop*/ ctx[0]
    			? 'product-image-desktop'
    			: 'product-image') + " svelte-zz5q6l"));

    			toggle_class(li, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			add_location(li, file$2, 48, 12, 1833);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*desktop*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*desktop*/ ctx[0]
    			? 'product-image-desktop'
    			: 'product-image') + " svelte-zz5q6l"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*desktop, images, slides*/ 11) {
    				toggle_class(li, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(48:12) {#each images as imageURL, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (66:20) {#each images as imageURL, index (index)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[11](/*index*/ ctx[16]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-preview svelte-zz5q6l");
    			if (!src_url_equal(img.src, img_src_value = /*imageURL*/ ctx[14])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `product`);
    			add_location(img, file$2, 69, 28, 3281);
    			attr_dev(div, "class", "preview-product-desktop svelte-zz5q6l");
    			toggle_class(div, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			add_location(div, file$2, 67, 24, 3057);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_4, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*images, slides*/ 10) {
    				toggle_class(div, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(66:20) {#each images as imageURL, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (82:12) {#each images as imageURL, index (index)}
    function create_each_block_1(key_1, ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*imageURL*/ ctx[14])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `product #${/*index*/ ctx[16] + 1}`);
    			attr_dev(img, "class", "svelte-zz5q6l");
    			add_location(img, file$2, 84, 16, 3851);

    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*desktop*/ ctx[0]
    			? 'product-image-desktop'
    			: 'product-image') + " svelte-zz5q6l"));

    			toggle_class(li, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			add_location(li, file$2, 82, 12, 3663);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*imgModalToggle*/ ctx[6], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*desktop*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*desktop*/ ctx[0]
    			? 'product-image-desktop'
    			: 'product-image') + " svelte-zz5q6l"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*desktop, images, slides*/ 11) {
    				toggle_class(li, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:12) {#each images as imageURL, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (91:4) {#if desktop}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*images*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[16];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "preview-inner svelte-zz5q6l");
    			add_location(div0, file$2, 92, 8, 4062);
    			attr_dev(div1, "class", "preview-outer svelte-zz5q6l");
    			add_location(div1, file$2, 91, 4, 4025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images, slides, previewClicker*/ 42) {
    				each_value = /*images*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:4) {#if desktop}",
    		ctx
    	});

    	return block;
    }

    // (94:16) {#each images as imageURL, index (index)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_5() {
    		return /*click_handler_5*/ ctx[12](/*index*/ ctx[16]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-preview svelte-zz5q6l");
    			if (!src_url_equal(img.src, img_src_value = /*imageURL*/ ctx[14])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `product`);
    			add_location(img, file$2, 97, 24, 4464);
    			attr_dev(div, "class", "preview-product-desktop svelte-zz5q6l");
    			toggle_class(div, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
    			add_location(div, file$2, 95, 20, 4248);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_5, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*images, slides*/ 10) {
    				toggle_class(div, "active", /*index*/ ctx[16] === /*slides*/ ctx[1]);
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
    		source: "(94:16) {#each images as imageURL, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let button0;
    	let svg0;
    	let path0;
    	let t0;
    	let button1;
    	let svg1;
    	let path1;
    	let div0_class_value;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_class_value;
    	let t3;
    	let div2_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*desktop*/ ctx[0] && create_if_block_1(ctx);
    	let each_value_1 = /*images*/ ctx[3];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[16];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block1 = /*desktop*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(path0, "d", "M11 1 3 9l8 8");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "fill-rule", "evenodd");
    			add_location(path0, file$2, 31, 95, 849);
    			attr_dev(svg0, "class", "arrow-sign-left svelte-zz5q6l");
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "18");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$2, 31, 8, 762);
    			attr_dev(button0, "class", "arrow-circle svelte-zz5q6l");
    			add_location(button0, file$2, 30, 4, 684);
    			attr_dev(path1, "d", "m2 1 8 8-8 8");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "fill-rule", "evenodd");
    			add_location(path1, file$2, 34, 96, 1098);
    			attr_dev(svg1, "class", "arrow-sign-right svelte-zz5q6l");
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "18");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$2, 34, 8, 1010);
    			attr_dev(button1, "class", "arrow-circle svelte-zz5q6l");
    			add_location(button1, file$2, 33, 4, 933);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'hidden' : 'buttons') + " svelte-zz5q6l"));
    			add_location(div0, file$2, 29, 0, 633);
    			attr_dev(ul, "class", "svelte-zz5q6l");
    			add_location(ul, file$2, 80, 8, 3590);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'pictures-desktop' : 'pictures') + " svelte-zz5q6l"));
    			add_location(div1, file$2, 79, 4, 3527);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'carousel-desktop' : 'carousel') + " svelte-zz5q6l"));
    			add_location(div2, file$2, 78, 0, 3468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t0);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(div2, t3);
    			if (if_block1) if_block1.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*desktop*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'hidden' : 'buttons') + " svelte-zz5q6l"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (/*desktop*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*desktop, images, slides, imgModalToggle*/ 75) {
    				each_value_1 = /*images*/ ctx[3];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*desktop*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'pictures-desktop' : 'pictures') + " svelte-zz5q6l"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*desktop*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*desktop*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'carousel-desktop' : 'carousel') + " svelte-zz5q6l"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Carousel', slots, []);
    	let slides = 0;
    	let { desktop } = $$props;
    	const images = products.images;

    	function handleButtonClick(offset) {
    		$$invalidate(1, slides = (slides + offset + images.length) % images.length);
    	}

    	function previewClicker(index) {
    		$$invalidate(1, slides = index);
    	}

    	let imgModalVisible = false;

    	const imgModalToggle = () => {
    		if (desktop) {
    			$$invalidate(2, imgModalVisible = !imgModalVisible);
    		}
    	};

    	function handleEscKey(event) {
    		if (event.key === "Escape") {
    			$$invalidate(2, imgModalVisible = false);
    		}
    	}

    	document.addEventListener("keydown", handleEscKey);

    	$$self.$$.on_mount.push(function () {
    		if (desktop === undefined && !('desktop' in $$props || $$self.$$.bound[$$self.$$.props['desktop']])) {
    			console.warn("<Carousel> was created without expected prop 'desktop'");
    		}
    	});

    	const writable_props = ['desktop'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleButtonClick(-1);
    	const click_handler_1 = () => handleButtonClick(1);
    	const click_handler_2 = () => handleButtonClick(-1);
    	const click_handler_3 = () => handleButtonClick(1);
    	const click_handler_4 = index => previewClicker(index);
    	const click_handler_5 = index => previewClicker(index);

    	$$self.$$set = $$props => {
    		if ('desktop' in $$props) $$invalidate(0, desktop = $$props.desktop);
    	};

    	$$self.$capture_state = () => ({
    		slides,
    		products,
    		desktop,
    		images,
    		handleButtonClick,
    		previewClicker,
    		imgModalVisible,
    		imgModalToggle,
    		handleEscKey
    	});

    	$$self.$inject_state = $$props => {
    		if ('slides' in $$props) $$invalidate(1, slides = $$props.slides);
    		if ('desktop' in $$props) $$invalidate(0, desktop = $$props.desktop);
    		if ('imgModalVisible' in $$props) $$invalidate(2, imgModalVisible = $$props.imgModalVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		desktop,
    		slides,
    		imgModalVisible,
    		images,
    		handleButtonClick,
    		previewClicker,
    		imgModalToggle,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { desktop: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get desktop() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desktop(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ItemDesc.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\ItemDesc.svelte";

    function create_fragment$1(ctx) {
    	let div12;
    	let div11;
    	let h4;
    	let t0;
    	let h4_class_value;
    	let t1;
    	let div0;
    	let h20;
    	let t2_value = products.name + "";
    	let t2;
    	let h20_class_value;
    	let t3;
    	let p0;
    	let t5;
    	let div4;
    	let div2;
    	let h21;
    	let t7;
    	let div1;
    	let t9;
    	let div3;
    	let t10_value = products.oldPrice + "";
    	let t10;
    	let div3_class_value;
    	let div4_class_value;
    	let t11;
    	let div10;
    	let div9;
    	let div8;
    	let div5;
    	let svg0;
    	let defs0;
    	let path0;
    	let use0;
    	let t12;
    	let div6;
    	let t13;
    	let t14;
    	let div7;
    	let svg1;
    	let defs1;
    	let path1;
    	let use1;
    	let t15;
    	let button;
    	let svg2;
    	let path2;
    	let t16;
    	let p1;
    	let div10_class_value;
    	let div12_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div11 = element("div");
    			h4 = element("h4");
    			t0 = text("SNEAKER COMPANY");
    			t1 = space();
    			div0 = element("div");
    			h20 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = `${products.description}`;
    			t5 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = `${products.price}`;
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = `${products.discount}`;
    			t9 = space();
    			div3 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			path0 = svg_element("path");
    			use0 = svg_element("use");
    			t12 = space();
    			div6 = element("div");
    			t13 = text(/*itemsToAdd*/ ctx[1]);
    			t14 = space();
    			div7 = element("div");
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			path1 = svg_element("path");
    			use1 = svg_element("use");
    			t15 = space();
    			button = element("button");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t16 = space();
    			p1 = element("p");
    			p1.textContent = "Add to cart";
    			attr_dev(h4, "class", h4_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'h4 desktop' : 'h4') + " svelte-1127w04"));
    			add_location(h4, file$1, 23, 8, 492);
    			attr_dev(h20, "class", h20_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'h2-desktop' : 'h2') + " svelte-1127w04"));
    			add_location(h20, file$1, 25, 12, 605);
    			attr_dev(div0, "class", "product-name svelte-1127w04");
    			add_location(div0, file$1, 24, 8, 565);
    			attr_dev(p0, "class", "description svelte-1127w04");
    			add_location(p0, file$1, 28, 8, 704);
    			attr_dev(h21, "class", "current-price");
    			add_location(h21, file$1, 31, 16, 881);
    			attr_dev(div1, "class", "discount svelte-1127w04");
    			add_location(div1, file$1, 32, 16, 947);
    			attr_dev(div2, "class", "price-row-left svelte-1127w04");
    			add_location(div2, file$1, 30, 12, 835);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'old-price desktop' : 'old-price') + " svelte-1127w04"));
    			add_location(div3, file$1, 37, 12, 1070);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'price-row desktop' : 'price-row') + " svelte-1127w04"));
    			add_location(div4, file$1, 29, 8, 763);
    			attr_dev(path0, "d", "M11.357 3.332A.641.641 0 0 0 12 2.69V.643A.641.641 0 0 0 11.357 0H.643A.641.641 0 0 0 0 .643v2.046c0 .357.287.643.643.643h10.714Z");
    			attr_dev(path0, "id", "a");
    			add_location(path0, file$1, 44, 154, 1628);
    			add_location(defs0, file$1, 44, 148, 1622);
    			attr_dev(use0, "fill-rule", "nonzero");
    			xlink_attr(use0, "xlink:href", "#a");
    			add_location(use0, file$1, 44, 309, 1783);
    			attr_dev(svg0, "class", "plus-minus svelte-1127w04");
    			attr_dev(svg0, "width", "12");
    			attr_dev(svg0, "height", "4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg0, file$1, 44, 24, 1498);
    			attr_dev(div5, "class", "svg-area svelte-1127w04");
    			add_location(div5, file$1, 43, 20, 1418);
    			attr_dev(div6, "class", "num-of-items svelte-1127w04");
    			add_location(div6, file$1, 46, 20, 1881);
    			attr_dev(path1, "d", "M12 7.023V4.977a.641.641 0 0 0-.643-.643h-3.69V.643A.641.641 0 0 0 7.022 0H4.977a.641.641 0 0 0-.643.643v3.69H.643A.641.641 0 0 0 0 4.978v2.046c0 .356.287.643.643.643h3.69v3.691c0 .356.288.643.644.643h2.046a.641.641 0 0 0 .643-.643v-3.69h3.691A.641.641 0 0 0 12 7.022Z");
    			attr_dev(path1, "id", "b");
    			add_location(path1, file$1, 49, 155, 2231);
    			add_location(defs1, file$1, 49, 149, 2225);
    			attr_dev(use1, "fill-rule", "nonzero");
    			xlink_attr(use1, "xlink:href", "#b");
    			add_location(use1, file$1, 49, 449, 2525);
    			attr_dev(svg1, "class", "plus-minus svelte-1127w04");
    			attr_dev(svg1, "width", "12");
    			attr_dev(svg1, "height", "12");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg1, file$1, 49, 24, 2100);
    			attr_dev(div7, "class", "svg-area svelte-1127w04");
    			add_location(div7, file$1, 48, 20, 2025);
    			attr_dev(div8, "class", "items-adder svelte-1127w04");
    			add_location(div8, file$1, 41, 16, 1293);
    			attr_dev(div9, "class", "items-adder-outer svelte-1127w04");
    			add_location(div9, file$1, 40, 12, 1244);
    			attr_dev(path2, "d", "M20.925 3.641H3.863L3.61.816A.896.896 0 0 0 2.717 0H.897a.896.896 0 1 0 0 1.792h1l1.031 11.483c.073.828.52 1.726 1.291 2.336C2.83 17.385 4.099 20 6.359 20c1.875 0 3.197-1.87 2.554-3.642h4.905c-.642 1.77.677 3.642 2.555 3.642a2.72 2.72 0 0 0 2.717-2.717 2.72 2.72 0 0 0-2.717-2.717H6.365c-.681 0-1.274-.41-1.53-1.009l14.321-.842a.896.896 0 0 0 .817-.677l1.821-7.283a.897.897 0 0 0-.87-1.114ZM6.358 18.208a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm10.015 0a.926.926 0 0 1 0-1.85.926.926 0 0 1 0 1.85Zm2.021-7.243-13.8.81-.57-6.341h15.753l-1.383 5.53Z");
    			attr_dev(path2, "fill", "#fff");
    			attr_dev(path2, "fill-rule", "nonzero");
    			add_location(path2, file$1, 55, 96, 2819);
    			attr_dev(svg2, "class", "cart-svg svelte-1127w04");
    			attr_dev(svg2, "width", "22");
    			attr_dev(svg2, "height", "20");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$1, 55, 16, 2739);
    			attr_dev(p1, "class", "svelte-1127w04");
    			add_location(p1, file$1, 56, 16, 3437);
    			attr_dev(button, "class", "button svelte-1127w04");
    			add_location(button, file$1, 54, 12, 2669);
    			attr_dev(div10, "class", div10_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'adder-button-desktop' : '') + " svelte-1127w04"));
    			add_location(div10, file$1, 39, 8, 1179);
    			attr_dev(div11, "class", "item-inner svelte-1127w04");
    			add_location(div11, file$1, 22, 4, 458);
    			attr_dev(div12, "class", div12_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'item-outer-desktop' : 'item-outer') + " svelte-1127w04"));
    			add_location(div12, file$1, 21, 0, 392);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, h4);
    			append_dev(h4, t0);
    			append_dev(div11, t1);
    			append_dev(div11, div0);
    			append_dev(div0, h20);
    			append_dev(h20, t2);
    			append_dev(div11, t3);
    			append_dev(div11, p0);
    			append_dev(div11, t5);
    			append_dev(div11, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, t10);
    			append_dev(div11, t11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, path0);
    			append_dev(svg0, use0);
    			append_dev(div8, t12);
    			append_dev(div8, div6);
    			append_dev(div6, t13);
    			append_dev(div8, t14);
    			append_dev(div8, div7);
    			append_dev(div7, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, path1);
    			append_dev(svg1, use1);
    			append_dev(div10, t15);
    			append_dev(div10, button);
    			append_dev(button, svg2);
    			append_dev(svg2, path2);
    			append_dev(button, t16);
    			append_dev(button, p1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div5, "click", /*click_handler*/ ctx[6], false, false, false, false),
    					listen_dev(div7, "click", /*click_handler_1*/ ctx[7], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*desktop*/ 1 && h4_class_value !== (h4_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'h4 desktop' : 'h4') + " svelte-1127w04"))) {
    				attr_dev(h4, "class", h4_class_value);
    			}

    			if (dirty & /*desktop*/ 1 && h20_class_value !== (h20_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'h2-desktop' : 'h2') + " svelte-1127w04"))) {
    				attr_dev(h20, "class", h20_class_value);
    			}

    			if (dirty & /*desktop*/ 1 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'old-price desktop' : 'old-price') + " svelte-1127w04"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*desktop*/ 1 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'price-row desktop' : 'price-row') + " svelte-1127w04"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty & /*itemsToAdd*/ 2) set_data_dev(t13, /*itemsToAdd*/ ctx[1]);

    			if (dirty & /*desktop*/ 1 && div10_class_value !== (div10_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'adder-button-desktop' : '') + " svelte-1127w04"))) {
    				attr_dev(div10, "class", div10_class_value);
    			}

    			if (dirty & /*desktop*/ 1 && div12_class_value !== (div12_class_value = "" + (null_to_empty(/*desktop*/ ctx[0] ? 'item-outer-desktop' : 'item-outer') + " svelte-1127w04"))) {
    				attr_dev(div12, "class", div12_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemDesc', slots, []);
    	let { desktop } = $$props;
    	let { cartItems = 0 } = $$props;
    	let itemsToAdd = 0;

    	const addItem = () => {
    		$$invalidate(1, itemsToAdd++, itemsToAdd);
    	};

    	const subtractItem = () => {
    		if (itemsToAdd >= 1) {
    			$$invalidate(1, itemsToAdd--, itemsToAdd);
    		}
    	};

    	const addToCart = () => {
    		if (itemsToAdd >= 1) {
    			$$invalidate(5, cartItems = itemsToAdd);
    		}
    	};

    	$$self.$$.on_mount.push(function () {
    		if (desktop === undefined && !('desktop' in $$props || $$self.$$.bound[$$self.$$.props['desktop']])) {
    			console.warn("<ItemDesc> was created without expected prop 'desktop'");
    		}
    	});

    	const writable_props = ['desktop', 'cartItems'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemDesc> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => subtractItem();
    	const click_handler_1 = () => addItem();
    	const click_handler_2 = () => addToCart();

    	$$self.$$set = $$props => {
    		if ('desktop' in $$props) $$invalidate(0, desktop = $$props.desktop);
    		if ('cartItems' in $$props) $$invalidate(5, cartItems = $$props.cartItems);
    	};

    	$$self.$capture_state = () => ({
    		products,
    		desktop,
    		cartItems,
    		itemsToAdd,
    		addItem,
    		subtractItem,
    		addToCart
    	});

    	$$self.$inject_state = $$props => {
    		if ('desktop' in $$props) $$invalidate(0, desktop = $$props.desktop);
    		if ('cartItems' in $$props) $$invalidate(5, cartItems = $$props.cartItems);
    		if ('itemsToAdd' in $$props) $$invalidate(1, itemsToAdd = $$props.itemsToAdd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		desktop,
    		itemsToAdd,
    		addItem,
    		subtractItem,
    		addToCart,
    		cartItems,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ItemDesc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { desktop: 0, cartItems: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemDesc",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get desktop() {
    		throw new Error("<ItemDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desktop(value) {
    		throw new Error("<ItemDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cartItems() {
    		throw new Error("<ItemDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cartItems(value) {
    		throw new Error("<ItemDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const { window: window_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let navbar;
    	let updating_cartItems;
    	let updating_desktop;
    	let updating_menuVisible;
    	let t0;
    	let div2;
    	let div0;
    	let carousel;
    	let updating_desktop_1;
    	let div0_class_value;
    	let t1;
    	let div1;
    	let itemdesc;
    	let updating_desktop_2;
    	let updating_cartItems_1;
    	let div1_class_value;
    	let div2_class_value;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function navbar_cartItems_binding(value) {
    		/*navbar_cartItems_binding*/ ctx[4](value);
    	}

    	function navbar_desktop_binding(value) {
    		/*navbar_desktop_binding*/ ctx[5](value);
    	}

    	function navbar_menuVisible_binding(value) {
    		/*navbar_menuVisible_binding*/ ctx[6](value);
    	}

    	let navbar_props = {};

    	if (/*cartItems*/ ctx[0] !== void 0) {
    		navbar_props.cartItems = /*cartItems*/ ctx[0];
    	}

    	if (/*desktop*/ ctx[2] !== void 0) {
    		navbar_props.desktop = /*desktop*/ ctx[2];
    	}

    	if (/*menuVisible*/ ctx[1] !== void 0) {
    		navbar_props.menuVisible = /*menuVisible*/ ctx[1];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, 'cartItems', navbar_cartItems_binding));
    	binding_callbacks.push(() => bind(navbar, 'desktop', navbar_desktop_binding));
    	binding_callbacks.push(() => bind(navbar, 'menuVisible', navbar_menuVisible_binding));

    	function carousel_desktop_binding(value) {
    		/*carousel_desktop_binding*/ ctx[7](value);
    	}

    	let carousel_props = {};

    	if (/*desktop*/ ctx[2] !== void 0) {
    		carousel_props.desktop = /*desktop*/ ctx[2];
    	}

    	carousel = new Carousel({ props: carousel_props, $$inline: true });
    	binding_callbacks.push(() => bind(carousel, 'desktop', carousel_desktop_binding));

    	function itemdesc_desktop_binding(value) {
    		/*itemdesc_desktop_binding*/ ctx[8](value);
    	}

    	function itemdesc_cartItems_binding(value) {
    		/*itemdesc_cartItems_binding*/ ctx[9](value);
    	}

    	let itemdesc_props = {};

    	if (/*desktop*/ ctx[2] !== void 0) {
    		itemdesc_props.desktop = /*desktop*/ ctx[2];
    	}

    	if (/*cartItems*/ ctx[0] !== void 0) {
    		itemdesc_props.cartItems = /*cartItems*/ ctx[0];
    	}

    	itemdesc = new ItemDesc({ props: itemdesc_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemdesc, 'desktop', itemdesc_desktop_binding));
    	binding_callbacks.push(() => bind(itemdesc, 'cartItems', itemdesc_cartItems_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(carousel.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(itemdesc.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'Carousel-desktop' : 'Carousel') + " svelte-m1oq36"));
    			add_location(div0, file, 24, 2, 695);
    			attr_dev(div1, "class", div1_class_value = /*desktop*/ ctx[2] ? 'ItemDesc-desktop' : 'ItemDesc');
    			add_location(div1, file, 27, 2, 800);

    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'content-desktop'
    			: 'content-mobile') + " svelte-m1oq36"));

    			add_location(div2, file, 23, 1, 632);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'desktop-view' : 'mobile-view') + " svelte-m1oq36"));
    			add_location(div3, file, 21, 0, 484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			mount_component(navbar, div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			mount_component(carousel, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(itemdesc, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*handleResize*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};

    			if (!updating_cartItems && dirty & /*cartItems*/ 1) {
    				updating_cartItems = true;
    				navbar_changes.cartItems = /*cartItems*/ ctx[0];
    				add_flush_callback(() => updating_cartItems = false);
    			}

    			if (!updating_desktop && dirty & /*desktop*/ 4) {
    				updating_desktop = true;
    				navbar_changes.desktop = /*desktop*/ ctx[2];
    				add_flush_callback(() => updating_desktop = false);
    			}

    			if (!updating_menuVisible && dirty & /*menuVisible*/ 2) {
    				updating_menuVisible = true;
    				navbar_changes.menuVisible = /*menuVisible*/ ctx[1];
    				add_flush_callback(() => updating_menuVisible = false);
    			}

    			navbar.$set(navbar_changes);
    			const carousel_changes = {};

    			if (!updating_desktop_1 && dirty & /*desktop*/ 4) {
    				updating_desktop_1 = true;
    				carousel_changes.desktop = /*desktop*/ ctx[2];
    				add_flush_callback(() => updating_desktop_1 = false);
    			}

    			carousel.$set(carousel_changes);

    			if (!current || dirty & /*desktop*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'Carousel-desktop' : 'Carousel') + " svelte-m1oq36"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			const itemdesc_changes = {};

    			if (!updating_desktop_2 && dirty & /*desktop*/ 4) {
    				updating_desktop_2 = true;
    				itemdesc_changes.desktop = /*desktop*/ ctx[2];
    				add_flush_callback(() => updating_desktop_2 = false);
    			}

    			if (!updating_cartItems_1 && dirty & /*cartItems*/ 1) {
    				updating_cartItems_1 = true;
    				itemdesc_changes.cartItems = /*cartItems*/ ctx[0];
    				add_flush_callback(() => updating_cartItems_1 = false);
    			}

    			itemdesc.$set(itemdesc_changes);

    			if (!current || dirty & /*desktop*/ 4 && div1_class_value !== (div1_class_value = /*desktop*/ ctx[2] ? 'ItemDesc-desktop' : 'ItemDesc')) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*desktop*/ 4 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*desktop*/ ctx[2]
    			? 'content-desktop'
    			: 'content-mobile') + " svelte-m1oq36"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*desktop*/ 4 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*desktop*/ ctx[2] ? 'desktop-view' : 'mobile-view') + " svelte-m1oq36"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(carousel.$$.fragment, local);
    			transition_in(itemdesc.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(carousel.$$.fragment, local);
    			transition_out(itemdesc.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(navbar);
    			destroy_component(carousel);
    			destroy_component(itemdesc);
    			mounted = false;
    			dispose();
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
    	validate_slots('App', slots, []);
    	let cartItems = 0;
    	let windowSize = window.innerWidth;
    	let menuVisible = windowSize >= 376;
    	let desktop = windowSize >= 376;

    	const handleResize = () => {
    		windowSize = window.innerWidth;
    		$$invalidate(2, desktop = windowSize >= 376);
    		$$invalidate(1, menuVisible = windowSize >= 376);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_cartItems_binding(value) {
    		cartItems = value;
    		$$invalidate(0, cartItems);
    	}

    	function navbar_desktop_binding(value) {
    		desktop = value;
    		$$invalidate(2, desktop);
    	}

    	function navbar_menuVisible_binding(value) {
    		menuVisible = value;
    		$$invalidate(1, menuVisible);
    	}

    	function carousel_desktop_binding(value) {
    		desktop = value;
    		$$invalidate(2, desktop);
    	}

    	function itemdesc_desktop_binding(value) {
    		desktop = value;
    		$$invalidate(2, desktop);
    	}

    	function itemdesc_cartItems_binding(value) {
    		cartItems = value;
    		$$invalidate(0, cartItems);
    	}

    	$$self.$capture_state = () => ({
    		Navbar,
    		Carousel,
    		ItemDesc,
    		cartItems,
    		windowSize,
    		menuVisible,
    		desktop,
    		handleResize
    	});

    	$$self.$inject_state = $$props => {
    		if ('cartItems' in $$props) $$invalidate(0, cartItems = $$props.cartItems);
    		if ('windowSize' in $$props) windowSize = $$props.windowSize;
    		if ('menuVisible' in $$props) $$invalidate(1, menuVisible = $$props.menuVisible);
    		if ('desktop' in $$props) $$invalidate(2, desktop = $$props.desktop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cartItems,
    		menuVisible,
    		desktop,
    		handleResize,
    		navbar_cartItems_binding,
    		navbar_desktop_binding,
    		navbar_menuVisible_binding,
    		carousel_desktop_binding,
    		itemdesc_desktop_binding,
    		itemdesc_cartItems_binding
    	];
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
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
