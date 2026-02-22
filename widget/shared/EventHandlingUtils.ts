import { Gtk } from "ags/gtk4";


export const addScrollHandle = (btn: Gtk.Widget, scrollUpMethod: () => void, scrollDownMethod: () => void) => {
    btn.sensitive = true;
    btn.can_focus = true;

    const scroll = new Gtk.EventControllerScroll({
        flags: Gtk.EventControllerScrollFlags.DISCRETE | 
            Gtk.EventControllerScrollFlags.VERTICAL | 
            Gtk.EventControllerScrollFlags.HORIZONTAL,
    });

    scroll.connect("scroll", (_ctrl, dx, dy) => {
        if (dy < 0) scrollUpMethod();
        if (dy > 0) scrollDownMethod();
    });

    btn.add_controller(scroll);
}

export const addRightClickHandle = (button: Gtk.Widget, rightClickMethod: () => void) => {
    return addClickHandle(3, button, rightClickMethod);

};

export const addLeftClickHandle = (button: Gtk.Widget, leftClickMethod: () => void) => {
    return addClickHandle(1, button, leftClickMethod);
};

const addClickHandle = (click: number, button: Gtk.Widget, clickMethod: () => void) => {
        const gesture = Gtk.GestureClick.new();
    gesture.set_button(click); // 3 = clic derecho
    gesture.connect("pressed", (g, n_press, x, y) => {
        clickMethod();
    });

    button.add_controller(gesture);

    return button;
}