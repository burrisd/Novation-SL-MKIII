/*
 * Constants for physical controls in InControl mode.
 * The single-byte color offset uses these control values,
 * which are the same as the controls. These use NOTE ON
 * values sent to channel 16.
 */
const   control =
{
    id:
    {
        ROTARY_KNOB_1:              0x15,
        FADER_1:                    0x29,
        SOFTBUTTON_1:               0x33,
        SOFTBUTTON_9:               0x3b,
        SOFTBUTTON_17:              0x43,
        SCREEN_UP_BUTTON:           0x51,
        SCREEN_DOWN_BUTTON:         0x52,
        SCENE_LAUNCH_TOP:           0x53,
        SCENE_LAUNCH_BOTTOM:        0x54,
        PADS_UP_BUTTON:             0x55,
        PADS_DOWN_BUTTON:           0x56,
        RIGHT_SOFTBUTTONS_UP:       0x57,
        RIGHT_SOFTBUTTONS_DOWN:     0x58,
        GRID_BUTTON:                0x59,
        OPTIONS_BUTTON:             0x5a,
        SHIFT_BUTTON:               0x5b,
        DUPLICATE_BUTTON:           0x5c,
        CLEAR_BUTTON:               0x5d,
        TRACK_LEFT:                 0x66,
        TRACK_RIGHT:                0x67,
        REWIND:                     0x70,
        FAST_FORWARD:               0x71,
        STOP_BUTTON:                0x72,
        PLAY_BUTTON:                0x73,
        LOOP_BUTTON:                0x74,
        RECORD_BUTTON:              0x75,
        PAD_1:                      0x60,
        PAD_9:                      0x70
    }
}


/*
 * Constants for control LEDs using SYSEX commands.
 * The three-byte RGB control of the LEDs are set
 * using the CC values of the controls and the SYSEX
 * versions of the LED offsets. Since the colors in
 * InControl mode are derived from the Cubase track colors,
 * these will be the promary means of controlling colors.
 */
const   led =
{
    id:
    {
        FADER_1:                0x36,
        SOFTBUTTON_1:           0x04,
        SOFTBUTTON_9:           0x0c,
        SOFTBUTTON_17:          0x14,
        SCREEN_UP:              0x3e,
        SCREEN_DOWN:            0x3f,
        SCREEN_LAUNCH_TOP:      0x03,
        SCREEN_LAUNCH_BOTTOM:   0x04,
        PADS_UP:                0x00,
        PADS_DOWN:              0x01,
        RIGHT_SOFTBUTTONS_UP:   0x1c,
        RIGHT_SOFTBUTTONS_DOWN: 0x1d,
        GRID_BUTTON:            0x40,
        OPTIONS_BUTTON:         0x41,
        DUPLICATE_BUTTON:       0x42,
        CLEAR_BUTTON:           0x43,
        TRACK_LEFT:             0x1e,
        TRACK_RIGHT:            0x1f,
        REWIND:                 0x21,
        FAST_FORWARD:           0x22,
        STOP_BUTTON:            0x23,
        PLAY_BUTTON:            0x24,
        LOOP_BUTTON:            0x25,
        RECORD_BUTTON:          0x20,
        PAD_1:                  0x26,
        PAD_9:                  0x2e
    },
    cmd:
    {
        SOLID: 1,       /*!< Set LED to solid color. */
        FLASH: 2,       /*!< Set LED to flash between current and previous color. */
        PULSE: 3        /*!< Set LED to pulse from dim to bright. */
    },
    layout:
    {
        EMPTY:  0,      /*!< Blank screen. */
        KNOB:   1,      /*!< Knob layout. */
        BOX:    2       /*!< Text box layout. */
    }
}

const lcd =
{
    knob:
    {
        color:
        {
            TOP_BAR:    0,    /*!< Top color bar. */
            KNOB_ICON:  1,    /*!< Knob icon color. */
            BOTTOM_BAR: 2     /*!< Bottom color bar. */
        },
        text:
        {
            TEXT_1:     0,    /*!< Text line 1. */
            TEXT_2:     1,    /*!< Text line 2. */
            TEXT_3:     2,    /*!< Text line 3. */
            TEXT_4:     3     /*!< Text line 4. */
        },
        value:
        {
            KNOB_VALUE:     0,    /*!< Knob value. */
            SELECTED:       1     /*!< Selected indicator sets text 4 to lower bar color. */
        }
    },
    box:
    {
        color:
        {
            TOP_BOX:    0,    /*!< Top box color. */
            CENTER_BOX: 1,    /*!< Center box color. */
            BOTTOM_BOX: 2     /*!< Bottom box color. */
        },
        text:
        {
            TOP_TEXT_1:     0,    /*!< Top box line 1. */
            TOP_TEXT_2:     1,    /*!< Top box line 2. */
            CENTER_TEXT_1:  2,    /*!< Center box line 1. */
            CENTER_TEXT_2:  3,    /*!< Center box line 2. */
            LOWER_TEXT_1:   4,    /*!< Lower box line 1. */
            LOWER_TEXT_2:   5     /*!< Lower box line 2. */
        },
        value:
        {
            TOP_SELECTED:       0,    /*!< Top box selected, solid color or border. */
            CENTER_SELECTED:    1,    /*!< Center box selected, solid color or border. */
            LOWER_SELECTED:     2     /*!< Lower box selected, solid color or border. */
        }
    },
    center:
    {
        color:
        {
            LEFT_BAR:           0,    /*!< Left color bar. */
            TOP_RIGHT_BAR:      1,    /*!< Top right color bar. */
            BOTTOM_RIGHT_BAR:   2     /*!< Bottom right color bar. */
        },
        text:
        {
            LEFT_1:     0,
            LEFT_2:     1,
            RIGHT_1:    2,
            RIGHT_2:    3
        }
    }
}


module.exports =
{
    ccId:   control,
    ledId:  led,
    lcdId:  lcd
}

