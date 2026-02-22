import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import { addLeftClickHandle } from "./../../shared/EventHandlingUtils";

const weekMap = new Map<number, string>();
weekMap.set(1,"Lun");
weekMap.set(2,"Mar");
weekMap.set(3,"Mie");
weekMap.set(4,"Jue");
weekMap.set(5,"Vie");
weekMap.set(6,"Sab");
weekMap.set(0,"Dom");

const datetime = createPoll("", 1000, () => 
    new Date().toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false,
    })
);

const calendar = createPoll("", 60000, () => {
    let d = new Date();
    return weekMap.get(d.getDay()) + " " + d.getDate() + "/" + (d.getUTCMonth()+1) + "/" + (d.getFullYear()-2000);
});

export const DatetimeWidget = (): JSX.Element => {
    let popover: Gtk.Popover | undefined;
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={10}
            $={(self)=>addLeftClickHandle(self, () => {if (popover) popover.visible = !popover.visible;})}
        >
            <label label={datetime} class={"time-label"}/>
            <label label={calendar} class={"time-label"}/>
            <popover
                    class="popover"
                    $={(p) => {(popover = p)}}
                    hasArrow={false}
                    autohide={true}
                    onMap={(p) => p.add_css_class("visible")}
                    onUnmap={(p) => p.remove_css_class("visible")}
                >
                    <box
                        class={"popover-panel"}
                    >
                        {<Gtk.Calendar
                            class={"calendar"}
                            onDaySelected={(cal)=> {
                                if(cal.get_day_is_marked(cal.get_day()))
                                    cal.unmark_day(cal.get_day())
                                else
                                    cal.mark_day(cal.get_day())
                            }}
                        />}
                    </box>
                
                </popover>
        </box>
        

    );
};   