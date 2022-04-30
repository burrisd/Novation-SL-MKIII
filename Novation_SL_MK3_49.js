/**
 * @file    Novation_SL_49.js
 *
 * MIDI remote script for the Novation SL 49/61 MKIII keyboard
 * controller in Cubase 12 MIDI Remote.
 *
 * Initial project was a port from the Steinberg example MIDI
 * Remote script (RealWorldDevice.js). It is currently a work in
 * progress. It will be refactored to more closely resemble the
 * behavior of the SL MKIII operating standalone with controls
 * configured by Novation Components. The original port was done
 * by Benjamin Bajic - April, 2022.
 */

/*
    ##########################################################################
    ############### MIDI Remote Script for Novation SL MK3 49 ################
    ##### Development by Benjamin Bajic - https://bajic.biz - April,2022 #####
    ##########################################################################
    ############################ Version: 1.0.0 ##############################
    ##########################################################################
 */

/** The helper functions contruct the MIDI messages required
 *  to update the displays and LEDs based on values passed in to
 *  the functions.
 */
var helper         = require( './helper' );

/*
 *  NOTE:   When controlling LEDs, it is important to understand
 *          which of the value below to use. For single-byte color
 *          index, use the InControl CC values in the first section.
 *          To set color using RGB values, a SYSEX message is required
 *          and the ID from the SYSEX group must be used.
 */

/*
 * Constants for physical controls in InControl mode.
 * The single-byte color offset uses these control values,
 * which are the same as the controls. These use NOTE ON
 * values sent to channel 16.
 */
const   controlCC =
{
    ROTARY_KNOB_1             : 0x15,
    FADER_1                   : 0x29,
    SOFTBUTTON_1              : 0x33,
    SOFTBUTTON_9              : 0x3b,
    SOFTBUTTON_17             : 0x43,
    SCREEN_UP_BUTTON          : 0x51,
    SCREEN_DOWN_BUTTON        : 0x52,
    SCENE_LAUNCH_TOP          : 0x53,
    SCENE_LAUNCH_BOTTOM       : 0x54,
    PADS_UP_BUTTON            : 0x55,
    PADS_DOWN_BUTTON          : 0x56,
    RIGHT_SOFTBUTTONS_UP      : 0x57,
    RIGHT_SOFTBUTTONS_DOWN    : 0x58,
    GRID_BUTTON               : 0x59,
    OPTIONS_BUTTON            : 0x5a,
    SHIFT_BUTTON              : 0x5b,
    DUPLICATE_BUTTON          : 0x5c,
    CLEAR_BUTTON              : 0x5d,
    TRACK_LEFT                : 0x66,
    TRACK_RIGHT               : 0x67,
    REWIND                    : 0x70,
    FAST_FORWARD              : 0x71,
    STOP_BUTTON               : 0x72,
    PLAY_BUTTON               : 0x73,
    LOOP_BUTTON               : 0x74,
    RECORD_BUTTON             : 0x75,
    PAD_1                     : 0x60,
    PAD_9                     : 0x70
}


/*
 * Constants for control LEDs using SYSEX commands.
 * The three-byte RGB control of the LEDs are set
 * using the CC values of the controls and the SYSEX
 * versions of the LED offsets. Since the colors in
 * InControl mode are derived from the Cubase track colors,
 * these will be the promary means of controlling colors.
 */
const   ledRGBCC =
{
    FADER_1                 : 0x36,
    SOFTBUTTON_1            : 0x04,
    SOFTBUTTON_9            : 0x0c,
    SOFTBUTTON_17           : 0x14,
    SCREEN_UP               : 0x3e,
    SCREEN_DOWN             : 0x3f,
    SCREEN_LAUNCH_TOP       : 0x03,
    SCREEN_LAUNCH_BOTTOM    : 0x04,
    PADS_UP                 : 0x00,
    PADS_DOWN               : 0x01,
    RIGHT_SOFTBUTTONS_UP    : 0x1c,
    RIGHT_SOFTBUTTONS_DOWN  : 0x1d,
    GRID_BUTTON             : 0x40,
    OPTIONS_BUTTON          : 0x41,
    DUPLICATE_BUTTON        : 0x42,
    CLEAR_BUTTON            : 0x43,
    TRACK_LEFT              : 0x1e,
    TRACK_RIGHT             : 0x1f,
    REWIND                  : 0x21,
    FAST_FORWARD            : 0x22,
    STOP_BUTTON             : 0x23,
    PLAY_BUTTON             : 0x24,
    LOOP_BUTTON             : 0x25,
    RECORD_BUTTON           : 0x20,
    PAD_1                   : 0x26,
    PAD_9                   : 0x2e
}

/*
 * Small screen layout definitions.
 */
const lcdLayout =
{
    EMPTY        : 0,     /*!< Blank screen. */
    KNOB         : 1,     /*!< Knob layout. */
    BOX          : 2,     /*!< Text box layout. */
}

const knobLayout =
{
    color:
    {
        TOP_BAR             : 0,    /*!< Top color bar. */
        KNOB_ICON           : 1,    /*!< Knob icon color. */
        BOTTOM_BAR          : 2     /*!< Bottom color bar. */
    },
    text:
    {
        TEXT_1              : 0,    /*!< Text line 1. */
        TEXT_2              : 1,    /*!< Text line 2. */
        TEXT_3              : 2,    /*!< Text line 3. */
        TEXT_4              : 3     /*!< Text line 4. */
    },
    value:
    {
        KNOB_VALUE          : 0,    /*!< Knob value. */
        SELECTED            : 1     /*!< Selected indicator sets text 4 to lower bar color. */
    }
}

const boxLayout =
{
    color:
    {
        TOP_BOX             : 0,    /*!< Top box color. */
        CENTER_BOX          : 1,    /*!< Center box color. */
        BOTTOM_BOX          : 2     /*!< Bottom box color. */
    },
    text:
    {
        TOP_TEXT_1          : 0,    /*!< Top box line 1. */
        TOP_TEXT_2          : 1,    /*!< Top box line 2. */
        CENTER_TEXT_1       : 2,    /*!< Center box line 1. */
        CENTER_TEXT_2       : 3,    /*!< Center box line 2. */
        LOWER_TEXT_1        : 4,    /*!< Lower box line 1. */
        LOWER_TEXT_2        : 5     /*!< Lower box line 2. */
    },
    value:
    {
        TOP_SELECTED        : 0,    /*!< Top box selected, solid color or border. */
        CENTER_SELECTED     : 1,    /*!< Center box selected, solid color or border. */
        LOWER_SELECTED      : 2     /*!< Lower box selected, solid color or border. */
    }
}


const centerLayout =
{
    color:
    {
        LEFT_BAR           : 0,    /*!< Left color bar. */
        TOP_RIGHT_BAR      : 1,    /*!< Top right color bar. */
        BOTTOM_RIGHT_BAR   : 2     /*!< Bottom right color bar. */
    },
    text:
    {
        LEFT_1              : 0,
        LEFT_2              : 1,
        RIGHT_1             : 2,
        RIGHT_2             : 3
    }
}

const ledCmd =
{
    SOLID                   : 1,    /*!< Set LED to solid color. */
    FLASH                   : 2,    /*!< Set LED to flash between current and previous color. */
    PULSE                   : 3     /*!< Set LED to pulse from dim to bright. */
}

// Not currently used.
//const SCREEN_LAYOUT_COMMAND         = 1     /*!< Set screen layout command. */
//const SCREEN_PROPERTIES_COMMAND     = 2     /*!< Set screen properties command. */
//const LED_COMMAND                   = 3     /*!< Set LED function command. */
//const SCREEN_NOTIFICATION_COMMAND   = 4     /*!< Set notification command. */
//
//
//const SCREEN_PROPERTY_TEXT          = 1     /*!< Change text property. */
//const SCREEN_PROPERTY_COLOR         = 2     /*!< Change color property using index into color table. */
//const SCREEN_PROPERTY_VALUE         = 3     /*!< Change value property. */
//const SCREEN_PROPERTY_RGB           = 4     /*!< Change color property using 3-byte RGB value. */
//

const NUM_PIANO_KEYS                = 60;   /*!< Zero-based number of keys to display. */

const INCONTROLMIDICHANNEL          = 15    /*!< MIDI channel used by InControl mode. */

const SMALL_LCD_OFFSET              = 0     /*!< Starting index for small screens. Add channel offset. */
const CENTER_LCD_OFFSET             = 8     /*!< Center screen index. */


// Get the MIDI Remote API interfaces. (Required!)
var midiremote_api = require( 'midiremote_api_v1' )

// Create the device driver object.
var deviceDriver   = midiremote_api.makeDeviceDriver( 'Novation', 'SL MK3 49', 'David Burris - Burris Audio' )

// Create connections to the MIDI input and output.
var midiInput      = deviceDriver.mPorts.makeMidiInput( )
var midiOutput     = deviceDriver.mPorts.makeMidiOutput( )

const DEBUG_MODE    = 0

if( DEBUG_MODE == 1 )
{
    /**
     * For debugging MIDI traffic. These MIDI ports are created with
     * loopMIDI and configured with MIDI-OX such that the MIDI
     * traffic in both directions can be recorded. This is very
     * helpful is you want to observe MIDI traffic generated by
     * your callbacks.
     */
    deviceDriver.makeDetectionUnit( ).detectPortPair( midiInput, midiOutput )
        .expectInputNameEquals( 'To-Cubase' )
        .expectOutputNameEquals( 'From-Cubase' )
        .expectSysexIdentityResponse( /*vendor id (1 or 3 bytes, here: 3 bytes)*/'002029', /*device family*/'0101', /*model number*/'0000' )
}
else
{
    /**
     * For standard operation of InControl mode on the SL. These are
     * the ports you would connect to in MIDI-OX for the debug
     * sample above.
     */
    deviceDriver.makeDetectionUnit( ).detectPortPair( midiInput, midiOutput )
        .expectInputNameEquals( 'MIDIIN2 (Novation SL MkIII)' )
        .expectOutputNameEquals( 'MIDIOUT2 (Novation SL MkIII)' )
        .expectSysexIdentityResponse( /*vendor id (1 or 3 bytes, here: 3 bytes)*/'002029', /*device family*/'0101', /*model number*/'0000' )
}

// Define some global data for the application.
var trackRed   = [ ]
var trackGreen = [ ]
var trackBlue  = [ ]

/**
 * LCD accessor functions to simplify use of the helper
 * functions.
 */
function lcdActions( )
{
    var msg

    /**
     * Set displays to a default condition.
     */
    this.resetDisplays = function( context, midi )
    {
        helper.display.reset( context,  midi )
    }
    /**
     * Post a notification for the center LCD.
     */
    this.notification = function( context, line1, line2 )
    {
        msg = helper.sysex.setNotificationText( line1, line2 )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Update an LCD text item.
     */
    this.displayText = function( context, displayCol, displayRow, text )
    {
        msg = helper.sysex.displaySetTextOfColumn( displayCol, displayRow, text )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Update display item color using RGB.
     */
    this.displayColorRGB = function( context, displayCol, displayRow, red, green, blue )
    {
        msg = helper.sysex.setDisplayColorOfColumn( displayCol, displayRow, red, green, blue )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Update display item value text.
     */
    this.displayValue = function( context, displayCol, displayRow, value )
    {
        msg = helper.sysex.setDisplayValueOfColumn( displayCol, displayRow, value )
        midiOutput.sendMidi( context, msg )
    }
}

/**
 * LED accessor functions to simplify calling of helper
 * functions.
 */
function ledActions( )
{
    var msg

    /**
     * Set LED color by color index.
     */
    this.color = function( context, ledId, colorId )
    {
        msg = helper.note.setLEDColor( ledId, colorId )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Set LED color by RGB.
     */
    this.colorRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDColorRGB( ledId, red, green, blue )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Flash LED between this and previous color Ids.
     */
    this.flashRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDFlashRGB( ledId, red, green, blue )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Flash LED between two color Ids.
     */
    this.pulseRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDPulseRGB( ledId, red, green, blue )
        midiOutput.sendMidi( context, msg )
    }
}

var lcdApi = new lcdActions
var ledApi = new ledActions


/**
 * Construct the Fader strip. Each fader strip includes a fader, and LED, and two buttons
 * above the fader.
 *
 * @param faderIndex        Fader index.
 * @param x                 Horizontal location.
 * @param y                 Vertical location.
 *
 * @return                  Constucted fader strip.
 */
function makeFaderStrip( faderIndex, x, y )
{
    var faderStrip = { }

    var surface    = deviceDriver.mSurface

    createControls( )

    /**
     * Create the surface controls.
     */
    function createControls( )
    {
        /* The buttons may be expanded by moving to subPages and using the fader navigation
         * buttons to browse pages. This is similar to what is already partly implemented for the
         * knobs.
         */
        faderStrip.btnTop = surface.makeButton( x + 2 * faderIndex, y, 2, 1 )
        faderStrip.btnBottom = surface.makeButton( x + 2 * faderIndex, y + 1, 2, 1 )

        // Create faders and set to vertical. (Default). If you wanted horizontal, do that here.
        faderStrip.fader = surface.makeFader( x + 2 * faderIndex, y + 3, 2, 6 )
        faderStrip.fader.setTypeVertical( )
    }

    /**
     * Bind the controls.
     */
    function bindControls( )
    {
        // Bind the fader buttons and faders.
        faderStrip.btnTop.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SOFTBUTTON_9 + faderIndex )
        faderStrip.btnBottom.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SOFTBUTTON_17 + faderIndex )
        faderStrip.fader.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.FADER_1 + faderIndex )
    }

    // Fader callback functions.

    /**
     * Callback when a fader title changes.
     */
    faderStrip.fader.mSurfaceValue.mOnTitleChange = function( context, objectTitle, valueTitle ) {
        lcdApi.displayText( context, SMALL_LCD_OFFSET + faderIndex, knobLayout.TEXT_4, objectTitle )
    }

    /**
     * Callback when a fader color changes.
     *
     * Note that the color values received from Cubase here are
     * fractional values each color and the overall amplitude.
     */
    faderStrip.fader.mSurfaceValue.mOnColorChange = function( context, r, g, b, a, IsActive )
    {
        trackRed[ faderIndex ] = r * 127 * a
        trackGreen[ faderIndex ] = g * 127 * a
        trackBlue[ faderIndex ] = b * 127 * a

        /**
         * Update display row color.
         */
        function updateRow( rowIdx, red, green, blue )
        {
            lcdApi.displayColorRGB( context, SMALL_LCD_OFFSET + faderIndex, rowIdx, red,
                                 green, blue )
        }
        ledApi.colorRGB( context, ledRGBCC.FADER_1 + faderIndex, trackRed[ faderIndex ] * .8,
                      trackGreen[ faderIndex ] * .8, trackBlue[ faderIndex ] * .8 )

        /**
         * Update color of the top and bottom bars.
         */
        updateRow( knobLayout.color.TOP_BAR, trackRed[faderIndex] , trackGreen[faderIndex] ,
                   trackBlue[ faderIndex ] )
        updateRow( knobLayout.color.BOTTOM_BAR, trackRed[ faderIndex ], trackGreen[ faderIndex ],
                   trackBlue[ faderIndex ] )
    }


    /**
     * Callback for mute button.
     *
     * @param context   Device driver context.
     * @param value     New button value.
     */
    faderStrip.btnTop.mSurfaceValue.mOnProcessValueChange = function( context, value )
    {
        if( value )
        {
            ledApi.colorRGB( context, controlCC.SOFTBUTTON_9 + faderIndex, trackRed[ faderIndex ],
                          trackGreen[ faderIndex ], trackBlue[ faderIndex ] )
        }
        else
        {
            ledApi.colorRGB( context, controlCC.SOFTBUTTON_9 + faderIndex, 20, 20, 20 )
        }
    }

    /**
     * Callback for solo button.
     *
     * @param context   Device driver context.
     * @param value     New button value.
     */
    faderStrip.btnBottom.mSurfaceValue.mOnProcessValueChange = function( context, value )
    {
        if( value )
        {
            ledApi.colorRGB( context, ledRGBCC.SOFTBUTTON_17 + faderIndex, trackRed[ faderIndex ], trackGreen[ faderIndex ],
                          trackBlue[ faderIndex ] )
        }
        else
        {
            ledApi.colorRGB( context, ledRGBCC.SOFTBUTTON_17 + faderIndex, 20, 20, 20 )
        }
    }

    bindControls( )

    return faderStrip
}


/**
 * Construct the knob subpages. Each knob subpage on the
 * physical controller consists of controls and displays in a
 * vertical column under the knob.
 *
 * @todo It seems likely that the pads should be grouped
 *       differently than currently. Likely they should have
 *       their own subpages. They are currently constructed but
 *       not bound to functions.
 *
 * @param knobIndex     Knob index.
 * @param x             Horizontal location.
 * @param y             Vertical location.
 *
 * @return  Constructed knob strip.
 */
function makeKnobStrip( knobIndex, x, y )
{
    var knobStrip = { }
    var surface   = deviceDriver.mSurface

    /**
     * Create the controls.
     */
    function createControls( )
    {
        // Create the controls for each "knob strip".
        knobStrip.knob = surface.makeKnob( x + 2 * knobIndex, y, 2, 2 )
        knobStrip.button = surface.makeButton( x + 2 * knobIndex, y + 4, 2, 1 )
        knobStrip.pad1 = surface.makeTriggerPad( x + 2 * knobIndex, y + 5, 2, 2 )
        knobStrip.pad2 = surface.makeTriggerPad( x + 2 * knobIndex, y + 7, 2, 2 )
    }

    createControls( )

    /**
     * Bind controls.
     */
    function bindControls( )
    {
        /* Control bindings to knob assembly knobs, buttons, and pads to MIDI CC messages.
         * The pads should probably be isolated into their own subpage but they're here for now.
         */
        knobStrip.knob.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.ROTARY_KNOB_1 + knobIndex ).setTypeRelativeTwosComplement( )
        knobStrip.button.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SOFTBUTTON_1 + knobIndex )
        knobStrip.pad1.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToNote( INCONTROLMIDICHANNEL, controlCC.PAD_1 + knobIndex )
        knobStrip.pad2.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToNote( INCONTROLMIDICHANNEL, controlCC.PAD_9 + knobIndex )
    }

    /**
     * Callback for the display value when the knob rotation changes
     * value.
     */
    knobStrip.knob.mSurfaceValue.mOnProcessValueChange = function( context, newValue )
    {
        lcdApi.displayValue( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.value.KNOB_VALUE, newValue * 127 )
    }
    /**
     * Callback for the display when the knob display value changes.
     */
    knobStrip.knob.mSurfaceValue.mOnDisplayValueChange = function( context, value, units )
    {
        lcdApi.displayText( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.text.TEXT_3, value )
    }
    /**
     * Callback for the the display when the knob display title
     * change.
     */
    knobStrip.knob.mSurfaceValue.mOnTitleChange = function( context, objectTitle, valueTitle )
    {
        lcdApi.displayText( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.text.TEXT_2, valueTitle )
        lcdApi.displayText( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.text.TEXT_1, objectTitle )

        var msg = lcdApi.notification( context, 'Version', 'v0.0.4' )
    }
    /**
     * Callback for when button value changes.
     */
    knobStrip.button.mSurfaceValue.mOnProcessValueChange = function( context, newValue )
    {
        var msg

        if( newValue )
        {
            ledApi.colorRGB( context, ledRGBCC.SOFTBUTTON_1 + knobIndex, trackRed[ knobIndex ],
                          trackGreen[ knobIndex ], trackBlue[ knobIndex ] )
            lcdApi.displayValue( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.value.SELECTED, 1 )
        }
        else
        {
            ledApi.colorRGB( context, ledRGBCC.SOFTBUTTON_1 + knobIndex, 20, 20, 20 )
            lcdApi.displayValue( context, SMALL_LCD_OFFSET + knobIndex, knobLayout.value.SELECTED, 0 )
        }
    }

    bindControls( )

    return knobStrip
}


/**
 * Construct the Transport buttons.
 *
 * @param x     Horizontal location.
 * @param y     Verticle location.
 *
 * @return      Constructed tranport assembly.
 */
function makeTransport( x, y )
{
    var transport = { }

    var surface   = deviceDriver.mSurface

    var w         = 2
    var h         = 2

    var currX     = x

    function createControls( )
    {
        // Create the buttons.

        transport.btnRewind = surface.makeButton( currX, y, w, h );
        currX += w;
        transport.btnForward = surface.makeButton( currX, y, w, h );
        currX += w;
        transport.btnStop = surface.makeButton( currX, y, w, h );
        currX += w;
        transport.btnStart = surface.makeButton( currX, y, w, h );
        currX += w;
        transport.btnCycle = surface.makeButton( currX, y, w, h );
        currX += w;
        transport.btnRecord = surface.makeButton( currX, y, w, h );
        currX += w;
    }


    function bindControls( )
    {
        // Bind MIDI CC to the physical buttons.
        transport.btnRewind.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.REWIND )
        transport.btnForward.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.FAST_FORWARD )
        transport.btnStop.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.STOP_BUTTON )
        transport.btnStart.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.PLAY_BUTTON )
        transport.btnCycle.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.LOOP_BUTTON )
        transport.btnRecord.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.RECORD_BUTTON )
    }

    createControls( )
    bindControls( )

    return transport
}


/**
 * Construct the control surface elements.
 *
 * @return  Constructed control surface assembly.
 */
function makeSurfaceElements( )
{
    var surfaceElements = { }
    var surface         = deviceDriver.mSurface

    surfaceElements.numStrips = 8

    surfaceElements.knobStrips = { }
    surfaceElements.faderStrips = { }

    var xKnobStrip = 6
    var yKnobStrip = 0

    /**
     * Create controls.
     */
    function createControls( )
    {
        // Create device label.
        surfaceElements.deviceLabel = surface.makeLabelField( 45, 0, 7, 2 )

        // Pitch and Mod are commented for now.
        //surfaceElements.modWheel = surface.makeModWheel(3, 11, 1, 6)
        //surfaceElements.pitchwheel = surface.makePitchBend( 1, 11, 1, 6 )

        // Create left.right arrow buttons.
        surfaceElements.btn_prevTrack = surface.makeButton( 0, 7, 2, 1 )
        surfaceElements.btn_nextTrack = surface.makeButton( 2, 7, 2, 1 )

        surfaceElements.btn_prevKnobSubPage = surface.makeButton( 4, 2, 2, 1 )
        surfaceElements.btn_nextKnobSubPage = surface.makeButton( 4, 3, 2, 1 )

        surfaceElements.btn_prevDriverPage = surface.makeButton( 4, 5, 2, 2 )
        surfaceElements.btn_prevDriverPage.setShapeCircle( )

        surfaceElements.btn_nextDriverPage = surface.makeButton( 4, 7, 2, 2 )
        surfaceElements.btn_nextDriverPage.setShapeCircle( )

        surfaceElements.btn_prevFaderSubPage = surface.makeButton( 40, 0, 2, 1 )
        surfaceElements.btn_nextFaderSubPage = surface.makeButton( 40, 1, 2, 1 )

        surfaceElements.btn_options = surface.makeButton( 22, 4, 2, 1 )
        surfaceElements.btn_grid = surface.makeButton( 4, 4, 2, 1 )
        surfaceElements.btn_clear = surface.makeButton( 0, 6, 2, 1 )
        surfaceElements.btn_duplicate = surface.makeButton(  0, 5, 2, 1  )
        surfaceElements.btn_padLeft = surface.makeButton( 22, 5, 2, 2 )
        surfaceElements.btn_padLeft.setShapeCircle( )
        surfaceElements.btn_padRight = surface.makeButton( 22, 7, 2, 2 )
        surfaceElements.btn_padRight.setShapeCircle( )

        // Construct the dummy display placeholders.
        surfaceElements.knobStripBlindPanel = surface.makeBlindPanel( xKnobStrip, yKnobStrip + 2, surfaceElements.numStrips * 2, 2 )
        surfaceElements.knobStripBlindPanel2 = surface.makeBlindPanel( xKnobStrip + 16, yKnobStrip + 2, 2, 2 )

        // Create piano keys.
        surfaceElements.pianoKeys = surface.makePianoKeys( 5, 10, 48, 7, 0, NUM_PIANO_KEYS )

        /* Create the fader and knob assemblies. Currently the binding is also done here.
         * These assemblies are currently common to all control pages. In the near future
         * the binding code will be moved to separate functions so that the creation of the
         * assemblies is is not coupled to the binding. This will allow independent use of the
         * controls across the control pages, rather than the same functionality common to all
         * pages.
         */
        for (var i = 0; i < surfaceElements.numStrips; ++i) {
            surfaceElements.faderStrips[ i ] = makeFaderStrip( i, 24, 0 )
            surfaceElements.knobStrips[ i ] = makeKnobStrip( i, xKnobStrip, yKnobStrip )
        }
    }

    createControls( )

    /**
     * Bind controls.
     */
    function bindControls( )
    {

        // Bind the navigation controls.
        surfaceElements.btn_prevKnobSubPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SCREEN_UP_BUTTON )
        surfaceElements.btn_nextKnobSubPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SCREEN_DOWN_BUTTON )
        surfaceElements.btn_prevDriverPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.PADS_UP_BUTTON )
        surfaceElements.btn_nextDriverPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.PADS_DOWN_BUTTON )
        surfaceElements.btn_prevFaderSubPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.RIGHT_SOFTBUTTONS_UP )
        surfaceElements.btn_nextFaderSubPage.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.RIGHT_SOFTBUTTONS_DOWN )
        // Bind controls common to all pages.
        surfaceElements.btn_options.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.OPTIONS_BUTTON )
        surfaceElements.btn_grid.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.GRID_BUTTON )
        surfaceElements.btn_clear.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.CLEAR_BUTTON )
        surfaceElements.btn_duplicate.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.DUPLICATE_BUTTON )
        surfaceElements.btn_padLeft.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SCENE_LAUNCH_TOP )
        surfaceElements.btn_padRight.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.SCENE_LAUNCH_BOTTOM )
        surfaceElements.btn_prevTrack.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.TRACK_LEFT )
        surfaceElements.btn_nextTrack.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( INCONTROLMIDICHANNEL, controlCC.TRACK_RIGHT )

        /**
         * Transport button value change callback.
         *
         * @param button    Button index.
         * @param ledID     LED index.
         * @param colorID   Color index.
         */
        function makeTransportDisplayFeedback( button, ledID, colorId )
        {
            /**
             * Callback for value changes to the transport buttons
             * and controlling the colors of the buttons.
             */
            button.mSurfaceValue.mOnProcessValueChange = function( context, newValue ) {
                ledApi.color( context, ledID, colorId * newValue )
            }
        }

        // Bind the buttons values to control transport.
        makeTransportDisplayFeedback( surfaceElements.transport.btnRewind, controlCC.REWIND, 9 )
        makeTransportDisplayFeedback( surfaceElements.transport.btnForward, controlCC.FAST_FORWARD, 9 )
        makeTransportDisplayFeedback( surfaceElements.transport.btnStop, controlCC.STOP_BUTTON, 119 )
        makeTransportDisplayFeedback( surfaceElements.transport.btnStart, controlCC.PLAY_BUTTON, 22 )
        makeTransportDisplayFeedback( surfaceElements.transport.btnCycle, controlCC.LOOP_BUTTON, 54 )
        makeTransportDisplayFeedback( surfaceElements.transport.btnRecord, controlCC.RECORD_BUTTON, 5 )
    }


    // Create the transport control assembly.
    surfaceElements.transport = makeTransport( 41, 7 )

    bindControls( )

    return surfaceElements
}


var surfaceElements = makeSurfaceElements( )



/**
 * Construct a control page that includes bindings common to all
 * pages. The goal is for this function to be called in the
 * creation of all pages such that a common navigation method is
 * maintained across all pages by using the same controls.
 *
 * @param name Page name.
 *
 * @return Constructed page.
 */
function makePageWithDefaults( name )
{
    var page            = deviceDriver.mMapping.makePage( name )
    var numParts        = 8;

    // Create device label.
    page.setLabelFieldText( surfaceElements.deviceLabel, "61SL MKIII" )

    /* Bind the buttons for SL Part selection. Each part selection
     * selects the associated Cubase track for the part.
     */
    var hostMixerBankZone   = page.mHostAccess.mMixConsole.makeMixerBankZone( )
        .excludeInputChannels( )
        .excludeOutputChannels( )

    /**
     * Bind controls.
     */
    function bindControls( )
    {
        /**
         * Bind the Host mixer track to the selection buttons.
         */
        function bindChannelBankItem( index )
        {
            var channelBankItem     = hostMixerBankZone.makeMixerBankChannel( )
            var selectedButtonValue = surfaceElements.knobStrips[ index ].button.mSurfaceValue;

            // Bind the Cubase selected track with the currently selected button.
            page.makeValueBinding( selectedButtonValue, channelBankItem.mValue.mSelected )
        }
        for (var i = 0; i < numParts; ++i)
        {
            bindChannelBankItem( i )
        }


        // Bind the Host transport to the transport controls.
        page.makeValueBinding( surfaceElements.transport.btnRewind.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind )
        page.makeValueBinding( surfaceElements.transport.btnForward.mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward )
        page.makeValueBinding( surfaceElements.transport.btnStop.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop ).setTypeToggle( )
        page.makeValueBinding( surfaceElements.transport.btnStart.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart ).setTypeToggle( )
        page.makeValueBinding( surfaceElements.transport.btnCycle.mSurfaceValue, page.mHostAccess.mTransport.mValue.mCycleActive ).setTypeToggle( )
        page.makeValueBinding( surfaceElements.transport.btnRecord.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord ).setTypeToggle( )
    }

    bindControls( )

    return page
}


/**
 * Constuct a page for controls on the selected track. This page
 * was a part of the original test driver. It will likely be
 * replaced with the "Parts" page that was created for changing
 * the control paradigm to resemble the standalone behavior of
 * the SL controls.
 *
 * @return  Constructed selected track page.
 */
function makePageSelectedTrack( )
{
    var page                 = makePageWithDefaults( 'Selected Track' )
    var selectedTrackChannel = page.mHostAccess.mTrackSelection.mMixerChannel

    /**
     * Bind controls.
     */
    function bindControls( )
    {
        for( var idx = 0; idx < surfaceElements.knobStrips.length; ++idx )
        {
            page.makeValueBinding( surfaceElements.knobStrips[ idx ].knob.mSurfaceValue, selectedTrackChannel.mQuickControls.getByIndex( idx ) )
        }

        page.makeActionBinding( surfaceElements.btn_prevDriverPage.mSurfaceValue, deviceDriver.mAction.mPrevPage )
        page.makeActionBinding( surfaceElements.btn_nextDriverPage.mSurfaceValue, deviceDriver.mAction.mNextPage )
    }

    bindControls( )

    return page
}


/**
 * Construct subpage within the specified subpage area.
 *
 * @param subPageArea   Area to contain subpages.
 * @param name          Subpage name.
 *
 * @return  Constructed subpage.
 */
function makeSubPage( subPageArea, name )
{
    var subPage = subPageArea.makeSubPage( name )

    subPage.mOnActivate = function( activeDevice )
    {
        var fromSubpage = activeDevice.getState( 'Current SubPage' )

        activeDevice.setState( 'Current SubPage', name )
        console.log( 'Subpage ' + name )
    }
    return subPage
}


/**
 * Constuct the mixer page.This page was part of the original
 * test driver. It has been modified somewhat, primarily to
 * remove "Volume" from the knobs, since volume is already
 * mapped to the faders.
 *
 * @return  Constructed mixer page.
 */
function makePageMixer( )
{
    var page                 = makePageWithDefaults( 'Mixer' )
    var numParts             = 8;

    // Create subpage area to contain the subpages.
    var knobSubPageArea      = page.makeSubPageArea( 'Knobs' )

    // Create the pan subpage.
    var subPagePan           = makeSubPage( knobSubPageArea, 'Pan' )

    // Create the send subpages.
    var subPageListSendLevel = [ ]

    // Create subpages for the Sends.
    var numSendLevelSubPages = midiremote_api.mDefaults.getNumberOfSendSlots( )
    for( var subPageIdx = 0; subPageIdx < numSendLevelSubPages; ++subPageIdx )
    {
        var nameSubPage      = 'Send ' + ( subPageIdx + 1 ).toString( )
        var subPageSendLevel = makeSubPage( knobSubPageArea, nameSubPage )

        subPageListSendLevel.push( subPageSendLevel )
    }

    var hostMixerBankZone    = page.mHostAccess.mMixConsole.makeMixerBankZone( )
        .excludeInputChannels( )
        .excludeOutputChannels( )

    /**
     * Bind the "channel" controls.
     */
    function bindChannelBankItem( index )
    {
        var channelBankItem      = hostMixerBankZone.makeMixerBankChannel( )

        // Variables for the simplifcation of the binding code.
        var knobValue            = surfaceElements.knobStrips[ index ].knob.mSurfaceValue
        var muteValue            = surfaceElements.faderStrips[ index ].btnTop.mSurfaceValue
        var soloValue            = surfaceElements.faderStrips[ index ].btnBottom.mSurfaceValue
        var faderValue           = surfaceElements.faderStrips[ index ].fader.mSurfaceValue

        // Bind the pan knob on the pan subpage.
        page.makeValueBinding( knobValue, channelBankItem.mValue.mPan ).setSubPage( subPagePan )
        // Bind the mute and solo buttons and set to toggle mode.
        page.makeValueBinding( muteValue, channelBankItem.mValue.mMute ).setTypeToggle( )
        page.makeValueBinding( soloValue, channelBankItem.mValue.mSolo ).setTypeToggle( )

        // Bind volume to fader. Set the fader mode here.
        page.makeValueBinding( faderValue, channelBankItem.mValue.mVolume ).setValueTakeOverModePickup( )

        // Bind the sends to the appropriate send subpage(s).
        for( var subPageIdx = 0; subPageIdx < numSendLevelSubPages; ++subPageIdx )
        {
            var sendLevel = channelBankItem.mSends.getByIndex( subPageIdx ).mLevel
            var subPage   = subPageListSendLevel[ subPageIdx ]

            page.makeValueBinding( knobValue, sendLevel ).setSubPage( subPage )
        }

    }

    /**
     * Bind controls.
     */
    function bindControls( )
    {
        // Binding for subpage navigation.
        page.makeActionBinding( surfaceElements.btn_prevKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mPrev )
        page.makeActionBinding( surfaceElements.btn_nextKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mNext )
        page.makeActionBinding( surfaceElements.btn_prevDriverPage.mSurfaceValue, deviceDriver.mAction.mPrevPage )
        page.makeActionBinding( surfaceElements.btn_nextDriverPage.mSurfaceValue, deviceDriver.mAction.mNextPage )
        //page.makeActionBinding(surfaceElements.btn_prevFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mPrev)
        //page.makeActionBinding(surfaceElements.btn_nextFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mNext)

        for (var i = 0; i < numParts; ++i)
        {
            bindChannelBankItem( i )
        }
    }

    bindControls( )

    return page
}

/**
 * Create a page for the settings in each SL Part. This a a new
 * page for development of the SL navigation resembling the
 * standalone operation while in InControl mode.
 *
 * @return Created page.
 */
function makePageParts( )
{
    // Create "Parts" page with the common controls.
    var page             = makePageWithDefaults( 'Parts' )
    var numParts         = 8

    // Create the parts subpage area to contain the subpages.
    var knobSubPageArea  = page.makeSubPageArea( 'Knob Area' )
    var faderSubpageArea = page.makeSubPageArea( 'Fader Area' )

    function bindControls( )
    {
        // Make the bindings to traverse SL Parts. Each Part is a subpage.
        page.makeActionBinding( surfaceElements.btn_prevKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mPrev )
        page.makeActionBinding( surfaceElements.btn_nextKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mNext )
        page.makeActionBinding( surfaceElements.btn_prevFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mPrev )
        page.makeActionBinding( surfaceElements.btn_nextFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mNext )
        page.makeActionBinding( surfaceElements.btn_prevDriverPage.mSurfaceValue, deviceDriver.mAction.mPrevPage )
        page.makeActionBinding( surfaceElements.btn_nextDriverPage.mSurfaceValue, deviceDriver.mAction.mNextPage )
    }

    // Create the subppages for each of the eight parts.
    for( var subPageIdx = 0; subPageIdx < numParts; ++subPageIdx )
    {
        var nameSubPage = 'Knob Page ' + (subPageIdx + 1).toString( )
        var subPagePart = makeSubPage( knobSubPageArea, nameSubPage )

        nameSubPage = 'Fader Page' + (subPageIdx + 1).toString( )
        subPagePart = makeSubPage( faderSubpageArea, nameSubPage )
    }

    bindControls( )

    return page
}

// Create the driver pages. Each created page must bind to the navigation!
var pageMixer         = makePageMixer( )
var pageSelectedTrack = makePageSelectedTrack( )
var pageParts         = makePageParts( )


/**
 * Activation callback for the mixer page.
 */
pageMixer.mOnActivate = function( context )
{
    var fromPage = context.getState( 'Current Page' )
    var newPage  = 'Mixer'
    context.setState( 'Current Page', newPage )

    console.log( 'Page ' + newPage )

    lcdApi.resetDisplays( context, midiOutput )

    /* Currently there is no subpage for the fader
     * assembly on the Mixer page, so the center screen
     * labels for the fader buttons will be configured
     * here. They should be moved to a subpage and
     * handled in the subpage OnActive( ) callback.
     */
    lcdApi.displayText( context, CENTER_LCD_OFFSET, centerLayout.TEXT_1, 'Mute' )
    lcdApi.displayText( context, CENTER_LCD_OFFSET, centerLayout.TEXT_2, 'Solo' )
}

/**
 * Activation callback for selected track page.
 */
pageSelectedTrack.mOnActivate = function( context )
{
    var fromPage = context.getState( 'Current Page' )
    var newPage  = 'Selected Track'
    context.setState( 'Current Page ', newPage )

    console.log( 'Page ' + newPage )
    lcdApi.resetDisplays( context, midiOutput )
}

/**
 * Activation callback for the Parts page.
 */
pageParts.mOnActivate = function( context )
{
    var fromPage = context.getState( 'Current Page' )
    var newPage  = 'Parts'
    context.setState( 'Current Page', newPage )

    console.log( 'Page ' + newPage )
    lcdApi.resetDisplays( context, midiOutput )
}


