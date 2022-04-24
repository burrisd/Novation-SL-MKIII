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
var helper = require('./helper')

const NUM_PIANO_KEYS = 60

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
const ROTARY_KNOB_1             = 0x15
const FADER_1                   = 0x29
const SOFTBUTTON_1              = 0x33  
const SOFTBUTTON_9              = 0x3b
const SOFTBUTTON_17             = 0x43
const SCREEN_UP_BUTTON          = 0x51
const SCREEN_DOWN_BUTTON        = 0x52
const SCREEN_LAUNCH_TOP         = 0x53
const SCREEN_LAUNCH_BOTTOM      = 0x54
const PADS_UP_BUTTON            = 0x55
const PADS_DOWN_BUTTON          = 0x56
const RIGHT_SOFTBUTTONS_UP      = 0x57
const RIGHT_SOFTBUTTONS_DOWN    = 0x58
const GRID_BUTTON               = 0x59
const OPTIONS_BUTTON            = 0x5a
const SHIFT_BUTTON              = 0x5b
const DUPLICATE_BUTTON          = 0x5c
const CLEAR_BUTTON              = 0x5d
const TRACK_LEFT                = 0x66
const TRACK_RIGHT               = 0x67
const REWIND                    = 0x70
const FAST_FORWARD              = 0x71
const STOP_BUTTON               = 0x72
const PLAY_BUTTON               = 0x73
const LOOP_BUTTON               = 0x74
const RECORD_BUTTON             = 0x75
const PAD_1                     = 0x60
const PAD_9                     = 0x70

/*
 * Constants for control LEDs using SYSEX commands.
 * The three-byte RGB control of the LEDs are set 
 * using the CC values of the controls and the SYSEX
 * versions of the LED offsets. Since the colors in
 * InControl mode are derived from the Cubase track colors,
 * these will be the promary means of controlling colors.
 */
const FADER_1_LED               = 0x36
const SOFTBUTTON_1_LED          = 0x04
const SOFTBUTTON_9_LED          = 0x0c
const SOFTBUTTON_17_LED         = 0x14
const SCREEN_UP_LED             = 0x3e
const SCREEN_DOWN_LED           = 0x3f
const SCREEN_LAUNCH_TOP_LED     = 0x03
const SCREEN_LAUNCH_BOTTOM_LED  = 0x04
const PADS_UP_LED               = 0x00
const PADS_DOWN_LED             = 0x01
const RIGHT_SOFTBUTTONS_UP_LED  = 0x1c
const RIGHT_SOFTBUTTONS_DOWN_LED = 0x1d
const GRID_BUTTON_LED           = 0x40
const OPTIONS_BUTTON_LED        = 0x41
const DUPLICATE_BUTTON_LED      = 0x42
const CLEAR_BUTTON_LED          = 0x43
const TRACK_LEFT_LED            = 0x1e
const TRACK_RIGHT_LED           = 0x1f
const REWIND_LED                = 0x21
const FAST_FORWARD_LED          = 0x22
const STOP_BUTTON_LED           = 0x23
const PLAY_BUTTON_LED           = 0x24
const LOOP_BUTTON_LED           = 0x25
const RECORD_BUTTON_LED         = 0x20
const PAD_1_LED                 = 0x26
const PAD_9_LED                 = 0x2e

const INCONTROLMIDICHANNEL      = 15        /*!< MIDI channel used by InControl mode. */

/*
 * Small screen layout definitions.
 */
const SCREEN_LAYOUT_COMMAND         = 1     /*!< Set screen layout command. */
const SCREEN_PROPERTIES_COMMAND     = 2     /*!< Set screen properties command. */
const LED_COMMAND                   = 3     /*!< Set LED function command. */
const SCREEN_NOTIFICATION_COMMAND   = 4     /*!< Set notification command. */

const SMALL_LCD_LAYOUT_EMPTY    = 0     /*!< Blank screen. */
const SMALL_LCD_LAYOUT_KNOB     = 1     /*!< Knob layout. */
const SMALL_LCD_LAYOUT_BOX      = 2     /*!< Text box layout. */

const SMALL_LCD_TOP_BAR         = 0     /*!< Top color bar. */
const SMALL_LCD_KNOB_ICON_COLOR = 1     /*!< Knob icon color. */
const SMALL_LCD_BOTTOM_BAR      = 2     /*!< Bottom color bar. */

const CENTER_LCD_LEFT_BAR           = 0     /*!< Left color bar. */
const CENTER_LCD_TOP_RIGHT_BAR      = 1     /*!< Top right color bar. */
const CENTER_LCD_BOTTOM_RIGHT_BAR   = 2     /*!< Bottom right color bar. */

const SMALL_LCD_TEXT_1              = 0     /*!< Text line 1. */
const SMALL_LCD_TEXT_2              = 1     /*!< Text line 2. */
const SMALL_LCD_TEXT_3              = 2     /*!< Text line 3. */
const SMALL_LCD_TEXT_4              = 3     /*!< Text line 4. */
const SMALL_LCD_TOP_BOX_TEXT_1      = 0     /*!< Top box line 1. */
const SMALL_LCD_TOP_BOX_TEXT_2      = 1     /*!< Top box line 2. */
const SMALL_LCD_CENTER_BOX_TEXT_1   = 2     /*!< Center box line 1. */
const SMALL_LCD_CENTER_BOX_TEXT_2   = 3     /*!< Center box line 2. */
const SMALL_LCD_LOWER_BOX_TEXT_1    = 4     /*!< Lower box line 1. */
const SMALL_LCD_LOWER_BOX_TEXT_2    = 5     /*!< Lower box line 2. */

const SMALL_LCD_KNOB_VALUE      = 0     /*!< Knob value. */
const SMALL_LCD_SELECTED        = 1     /*!< Selected indicator sets text 4 to lower bar color. */
const SMALL_BOX_TOP_SELECTED    = 0     /*!< Top box selected, solid color or border. */
const SMALL_BOX_CENTER_SELECTED = 1     /*!< Center box selected, solid color or border. */
const SMALL_BOX_LOWER_SELECTED  = 2     /*!< Lower box selected, solid color or border. */

const LED_SOLID_COMMAND         = 1     /*!< Set LED to solid color. */
const LED_FLASH_COMMAND         = 2     /*!< Set LED to flash between current and previous color. */
const LED_PULSE_COMMAND         = 3     /*!< Set LED to pulse from dim to bright. */

const SMALL_LCD_OFFSET          = 0     /*!< Starting index for small screens. Add channel offset. */
const CENTER_LCD_OFFSET         = 8     /*!< Center screen index. */

const SCREEN_PROPERTY_TEXT      = 1     /*!< Change text property. */
const SCREEN_PROPERTY_COLOR     = 2     /*!< Change color property using index into color table. */
const SCREEN_PROPERTY_VALUE     = 3     /*!< Change value property. */
const SCREEN_PROPERTY_RGB       = 4     /*!< Change color property using 3-byte RGB value. */

// Get the MIDI Remote API interfaces. (Required!)
var midiremote_api = require('midiremote_api_v1')

// Create the device driver object.
var deviceDriver = midiremote_api.makeDeviceDriver('Novation', 'SL MK3 49', 'David Burris - Burris Audio')

// Create connections to the MIDI input and output.
var midiInput = deviceDriver.mPorts.makeMidiInput()
var midiOutput = deviceDriver.mPorts.makeMidiOutput()

// define all possible namings the devices MIDI ports could have
// NOTE: Windows and MacOS handle port naming differently
deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
    .expectInputNameEquals('MIDIIN2 (Novation SL MkIII)')
    .expectOutputNameEquals('MIDIOUT2 (Novation SL MkIII)')
    .expectSysexIdentityResponse(/*vendor id (1 or 3 bytes, here: 3 bytes)*/'002029', /*device family*/'0101', /*model number*/'0000')

//deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
//    .expectInputNameEquals('Novation SL MkIII')
//    .expectOutputNameEquals('Novation SL MkIII')
//    .expectSysexIdentityResponse(/*vendor id (1 or 3 bytes, here: 3 bytes)*/'002029', /*device family*/'0101', /*model number*/'0000')

/* deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
    .expectInputNameEquals('Novation SL MkIII')
    .expectOutputNameEquals('Novation SL MkIII') */

//deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
//    .expectInputNameContains('MIDIIN2')
//    .expectOutputNameContains('MIDIOUT2')
//    .expectSysexIdentityResponse(/*vendor id (1 or 3 bytes, here: 3 bytes)*/'002029', /*device family*/'0101', /*model number*/'0000')

var surface = deviceDriver.mSurface

// Define some global data for the application.
var trackRed = [ ]
var trackGreen = [ ]
var trackBlue = [ ]


/**
 * Construct the Fader strip. Each fader strip includes a fader, and LED, and two buttons
 * above the fader. 
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param faderIndex        Fader index.
 * @param x                 Horizontal location.
 * @param y                 Vertical location.
 * 
 * @return                  Constucted fader strip.
 */
function makeFaderStrip(faderIndex, x, y) {
    var faderStrip = {}

    /**
     * Bind a button to a MIDI CC message.
     */
    function bindButtonCC( button, chn, cc ) {
        button.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange( chn, cc )
    }

    /**
     * Bind a fader to a MIDI CC message.
     */
    function bindFaderCC( fader, chn, cc ) {
        fader.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange( chn, cc )
    }

    /* The buttons may be expanded by moving to subPages and using the fader navigation
     * buttons to browse pages. This is similar to what is already partly implemented for the
     * knobs.
     */
    faderStrip.btnMute = surface.makeButton(x + 2 * faderIndex, y, 2, 1)
    faderStrip.btnSolo = surface.makeButton(x + 2 * faderIndex, y + 1, 2, 1)

    // Create faders and set to vertical. (Default). If you wanted horizontal, do that here.
    faderStrip.fader = surface.makeFader(x + 2 * faderIndex, y + 3, 2, 6).setTypeVertical()

    // Bind the fader buttons and faders.
    bindButtonCC(faderStrip.btnMute, INCONTROLMIDICHANNEL, SOFTBUTTON_9 + faderIndex )
    bindButtonCC(faderStrip.btnSolo, INCONTROLMIDICHANNEL, SOFTBUTTON_17 + faderIndex )
    bindFaderCC(faderStrip.fader, INCONTROLMIDICHANNEL, FADER_1 + faderIndex)

    // Fader callback functions.

    /**
     * Bind the Cubase track titles to the labels for the displays.
     */
    faderStrip.fader.mSurfaceValue.mOnTitleChange = function (context, objectTitle, valueTitle) {
        var msg = helper.sysex.displaySetTextOfColumn(faderIndex, SMALL_LCD_TEXT_4, objectTitle)
        midiOutput.sendMidi(context, msg)
    }

    // Bind Cubase track colors to the remote faders and the controller LEDs and displays.
    faderStrip.fader.mSurfaceValue.mOnColorChange = function (context, r, g, b, a, isActive) {
        trackRed[ faderIndex ] = r * 127 * a
        trackGreen[ faderIndex ] = g * 127 * a
        trackBlue[ faderIndex ] = b * 127 * a

        /**
         * Update display row color.
         */
        function updateRow(rowIdx, red, green, blue ) {
            var msg = helper.sysex.setDisplayColorOfColumn(faderIndex, rowIdx, red, 
                                                           green, blue)
            midiOutput.sendMidi(context, msg )
        }
        var msg = helper.sysex.setLEDColorRGB( FADER_1_LED + faderIndex, 
                                               trackRed[faderIndex] * .8, 
                                               trackGreen[ faderIndex ] * .8, 
                                               trackBlue[ faderIndex ] * .8 )
        midiOutput.sendMidi(context, msg)

        /**
         * Update color of the top and bottom bars.
         */
        updateRow(SMALL_LCD_TOP_BAR, trackRed[ faderIndex ], trackGreen[ faderIndex ], 
                  trackBlue[ faderIndex ])
        updateRow(SMALL_LCD_BOTTOM_BAR, trackRed[ faderIndex ], trackGreen[ faderIndex ], 
                  trackBlue[ faderIndex ])
    }

    return faderStrip
}


/**
 * Construct the knob strip.
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param knobIndex     Knob index.
 * @param x             Horizontal location.
 * @param y             Vertical location. 
 *  
 * @return  Constructed knob strip. 
 */
function makeKnobStrip(knobIndex, x, y) {
    var knobStrip = {}
    
    // Define some local helper functions to make the code more readable.

    /**
     * Bind knob control change to MIDI CC.
     */
    function bindknobMidiCC(knob, chn, num) {
        knob.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange(chn, num).setTypeRelativeTwosComplement()
    }

    /**
     * Bind button control change to MIDI CC.
     */
    function bindbuttonMidiCC(button, chn, num) {
        button.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange(chn, num)
    }

    /**
     * Bind pad to MIDI note value.
     */
    function bindpadMidiNote( pad, chn, num ) {
        pad.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToNote(chn, num)
    }

    // Create the controls for each "knob strip".
    knobStrip.knob = surface.makeKnob(x + 2 * knobIndex, y, 2, 2)
    knobStrip.button = surface.makeButton(x + 2 * knobIndex, y + 4, 2, 1)
    knobStrip.pad1 = surface.makeTriggerPad(x + 2 * knobIndex, y + 5, 2, 2)
    knobStrip.pad2 = surface.makeTriggerPad(x + 2 * knobIndex, y + 7, 2, 2)

    /**
     * Callback for the display value when the knob rotation changes 
     * value. 
     */
    knobStrip.knob.mSurfaceValue.mOnProcessValueChange = function (context, newValue ) {
        var msg = helper.sysex.setDisplayValueOfColumn(knobIndex, SMALL_LCD_KNOB_VALUE, newValue * (127))
        midiOutput.sendMidi(context, msg)
    }
    /**
     * Callback for the display when the knob display value changes.
     */
    knobStrip.knob.mSurfaceValue.mOnDisplayValueChange = function (context, value, units) {
        var msg = helper.sysex.displaySetTextOfColumn(knobIndex, SMALL_LCD_TEXT_3, value)
        midiOutput.sendMidi(context, msg )
    }
    /**
     * Callback for the the display when the knob display title 
     * change. 
     */
    knobStrip.knob.mSurfaceValue.mOnTitleChange = function ( context, objectTitle, valueTitle) {
        var msg = helper.sysex.displaySetTextOfColumn( knobIndex, SMALL_LCD_TEXT_2, valueTitle)
        midiOutput.sendMidi( context, msg )
        msg = helper.sysex.displaySetTextOfColumn( knobIndex, SMALL_LCD_TEXT_1, objectTitle )
        midiOutput.sendMidi( context, msg )
        msg = helper.sysex.setNotificationText( objectTitle, valueTitle )
        midiOutput.sendMidi( context, msg )
    }
    /**
     * Callback for when button value changes.
     */
    knobStrip.button.mSurfaceValue.mOnProcessValueChange = function (context, newValue) {
        if (newValue)
        {
            var msg = helper.sysex.setLEDColorRGB( SOFTBUTTON_1_LED + knobIndex, trackRed[knobIndex],
                                                   trackGreen[knobIndex], trackBlue[knobIndex] )
            midiOutput.sendMidi( context, msg )
            msg = helper.sysex.setDisplayValueOfColumn( knobIndex, SMALL_LCD_SELECTED, 1 )
            midiOutput.sendMidi( context, msg )
        }
        else
        {
            var msg = helper.sysex.setLEDColorRGB( SOFTBUTTON_1_LED + knobIndex, 20, 20, 20 )
            midiOutput.sendMidi( context, msg )
            msg = helper.sysex.setDisplayValueOfColumn( knobIndex, SMALL_LCD_SELECTED, 0 )
            midiOutput.sendMidi( context, msg )
        }
    }

    /* Control bindings to knob assembly knobs, buttons, and pads to MIDI CC messages.
     * The pads should probably be isolated into their own subpage but they're here for now.
     */
    bindknobMidiCC(knobStrip.knob, INCONTROLMIDICHANNEL, ROTARY_KNOB_1 + knobIndex)
    bindbuttonMidiCC(knobStrip.button, INCONTROLMIDICHANNEL, SOFTBUTTON_1 + knobIndex)
    bindpadMidiNote(knobStrip.pad1, INCONTROLMIDICHANNEL, PAD_1 + knobIndex)
    bindpadMidiNote(knobStrip.pad2, INCONTROLMIDICHANNEL, PAD_9 + knobIndex)

    return knobStrip
}


/**
 * Construct the Transport buttons.
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param x     Horizontal location.
 * @param y     Verticle location. 
 *  
 * @return      Constructed tranport assembly. 
 */
function makeTransport(x, y) {
    var transport = {}

    var w = 2
    var h = 2

    var currX = x

    /**
     * Bind button to MIDI CC.
     */
    function bindMidiCC(button, chn, num) {
        button.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange(chn, num)
    }
    
    // Create the buttons.

    transport.btnRewind = surface.makeButton(currX, y, w, h)
    currX += w
    transport.btnForward = surface.makeButton(currX, y, w, h)
    currX += w
    transport.btnStop = surface.makeButton(currX, y, w, h)
    currX += w
    transport.btnStart = surface.makeButton(currX, y, w, h)
    currX += w
    transport.btnCycle = surface.makeButton(currX, y, w, h)
    currX += w
    transport.btnRecord = surface.makeButton(currX, y, w, h)
    currX += w

    // Bind MIDI CC to the physical buttons.
    bindMidiCC(transport.btnRewind, INCONTROLMIDICHANNEL, REWIND)
    bindMidiCC(transport.btnForward, INCONTROLMIDICHANNEL, FAST_FORWARD)
    bindMidiCC(transport.btnStop, INCONTROLMIDICHANNEL, STOP_BUTTON)
    bindMidiCC(transport.btnStart, INCONTROLMIDICHANNEL, PLAY_BUTTON)
    bindMidiCC(transport.btnCycle, INCONTROLMIDICHANNEL, LOOP_BUTTON)
    bindMidiCC(transport.btnRecord, INCONTROLMIDICHANNEL, RECORD_BUTTON)

    return transport
}


/**
 * Construct the control surface elements.
 * 
 * @author Dave Burris (04/19/2022) 
 *  
 * @return  Constructed control surface assembly. 
 */
function makeSurfaceElements() {
    var surfaceElements = {}

    surfaceElements.numStrips = 8

    surfaceElements.knobStrips = {}
    surfaceElements.faderStrips = {}

    var xKnobStrip = 6
    var yKnobStrip = 0

    /**
     * Bind controls to MIDI CC.
     */
    function bindMidiCC(button, chn, num) {
        button.mSurfaceValue.mMidiBinding.setInputPort(midiInput).bindToControlChange(chn, num)
    }

    // Create device label.
    surfaceElements.deviceLabel = surface.makeLabelField(45, 0, 7, 2)

    // Pitch and Mod are commented for now. 
    //surfaceElements.modWheel = surface.makeModWheel(3, 11, 1, 6)
    //surfaceElements.pitchwheel = surface.makePitchBend( 1, 11, 1, 6 )

    // Create left.right arrow buttons.
    surfaceElements.btn_prevTrack = surface.makeButton(0, 7, 2, 1)
    surfaceElements.btn_nextTrack = surface.makeButton(2, 7, 2, 1)

    surfaceElements.btn_prevKnobSubPage = surface.makeButton(4, 2, 2, 1)
    surfaceElements.btn_nextKnobSubPage = surface.makeButton(4, 3, 2, 1)

    surfaceElements.btn_prevDriverPage = surface.makeButton(4, 5, 2, 2)
    surfaceElements.btn_prevDriverPage.setShapeCircle()

    surfaceElements.btn_nextDriverPage = surface.makeButton(4, 7, 2, 2)
    surfaceElements.btn_nextDriverPage.setShapeCircle()

    surfaceElements.btn_prevFaderSubPage = surface.makeButton( 40, 0, 2, 1 )
    surfaceElements.btn_nextFaderSubPage = surface.makeButton( 40, 1, 2, 1 )

    // Construct the dummy display placeholders.
    surfaceElements.knobStripBlindPanel = surface.makeBlindPanel(xKnobStrip, yKnobStrip + 2, surfaceElements.numStrips * 2, 2)
    surfaceElements.knobStripBlindPanel2 = surface.makeBlindPanel(xKnobStrip + 16, yKnobStrip + 2, 2, 2)

    // Create piano keys.
    surfaceElements.pianoKeys = surface.makePianoKeys(5, 10, 48, 7, 0, NUM_PIANO_KEYS)

    /* Create the fader and knob assemblies. Currently the binding is also done here.
     * These assemblies are currently common to all control pages. In the near future
     * the binding code will be moved to separate functions so that the creation of the
     * assemblies is is not coupled to the binding. This will allow independent use of the
     * controls across the control pages, rather than the same functionality common to all
     * pages.
     */
    for(var i = 0; i < surfaceElements.numStrips; ++i) {
        surfaceElements.faderStrips[i] = makeFaderStrip(i, 24, 0)
        surfaceElements.knobStrips[i] = makeKnobStrip(i, xKnobStrip, yKnobStrip)
    }

    // Create the transport control assembly.
    surfaceElements.transport = makeTransport(41, 7)

    // Bind the navigation controls.
    bindMidiCC(surfaceElements.btn_prevKnobSubPage, INCONTROLMIDICHANNEL, SCREEN_UP_BUTTON)
    bindMidiCC(surfaceElements.btn_nextKnobSubPage, INCONTROLMIDICHANNEL, SCREEN_DOWN_BUTTON)
    bindMidiCC(surfaceElements.btn_prevDriverPage, INCONTROLMIDICHANNEL, PADS_UP_BUTTON)
    bindMidiCC(surfaceElements.btn_nextDriverPage, INCONTROLMIDICHANNEL, PADS_DOWN_BUTTON)
    bindMidiCC(surfaceElements.btn_prevFaderSubPage, INCONTROLMIDICHANNEL, RIGHT_SOFTBUTTONS_UP)
    bindMidiCC(surfaceElements.btn_nextFaderSubPage, INCONTROLMIDICHANNEL, RIGHT_SOFTBUTTONS_DOWN)

    return surfaceElements
}


var surfaceElements = makeSurfaceElements()

/**
 * Transport button value change callback.
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param button    Button index.
 * @param ledID     LED index.
 * @param colorID   Color index.
 */
function makeTransportDisplayFeedback(button, ledID, colorID) {
    /**
     * Callback for value changes to the transport buttons 
     * and controlling the colors of the buttons. 
     */
	button.mSurfaceValue.mOnProcessValueChange = function (context, newValue) {
        var msg = helper.sysex.setLEDColor( ledID, colorID * newValue )
		midiOutput.sendMidi(context, msg )
	}
}

// Bind the buttons values to control transport.
makeTransportDisplayFeedback(surfaceElements.transport.btnRewind, REWIND, 3)
makeTransportDisplayFeedback(surfaceElements.transport.btnForward, FAST_FORWARD, 3)
makeTransportDisplayFeedback(surfaceElements.transport.btnStop, STOP_BUTTON, 3)
makeTransportDisplayFeedback(surfaceElements.transport.btnStart, PLAY_BUTTON, 21)
makeTransportDisplayFeedback(surfaceElements.transport.btnCycle, LOOP_BUTTON, 49)
makeTransportDisplayFeedback(surfaceElements.transport.btnRecord, RECORD_BUTTON, 5)


/**
 * Construct a control page that includes bindings common to all
 * pages. The goal is for this function to be called in the 
 * creation of all pages such that a common navigation method is 
 * maintained across all pages by using the same controls. 
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param name Page name. 
 *  
 * @return Constructed page. 
 */
function makePageWithDefaults(name) {
    var page = deviceDriver.mMapping.makePage(name)
    var numParts = 8;

    // Create device label.
    page.setLabelFieldText(surfaceElements.deviceLabel, "61SL MKIII")
  
    /* Bind the buttons for SL Part selection. Each part selection
     * selects the associated Cubase track for the part.
     */
    var hostMixerBankZone = page.mHostAccess.mMixConsole.makeMixerBankZone()
        .excludeInputChannels()
        .excludeOutputChannels()

    /**
     * Bind the Host mixer track to the selection buttons.
     */
    function bindChannelBankItem(index) {
        var channelBankItem = hostMixerBankZone.makeMixerBankChannel()
        var selectedButtonValue = surfaceElements.knobStrips[index].button.mSurfaceValue;

        // Bind the Cubase selected track with the currently selected button.
        page.makeValueBinding(selectedButtonValue, channelBankItem.mValue.mSelected)
    }
    for (var i = 0; i < numParts; ++i )
    {
        bindChannelBankItem(i)
    }

    // Bind the Host transport to the transport controls.
    page.makeValueBinding(surfaceElements.transport.btnRewind.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRewind)
    page.makeValueBinding(surfaceElements.transport.btnForward.mSurfaceValue, page.mHostAccess.mTransport.mValue.mForward)
    page.makeValueBinding(surfaceElements.transport.btnStop.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStop).setTypeToggle()
    page.makeValueBinding(surfaceElements.transport.btnStart.mSurfaceValue, page.mHostAccess.mTransport.mValue.mStart).setTypeToggle()
    page.makeValueBinding(surfaceElements.transport.btnCycle.mSurfaceValue, page.mHostAccess.mTransport.mValue.mCycleActive).setTypeToggle()
    page.makeValueBinding(surfaceElements.transport.btnRecord.mSurfaceValue, page.mHostAccess.mTransport.mValue.mRecord).setTypeToggle()

    return page
}


/**
 * Constuct a page for controls on the selected track. This page 
 * was a part of the original test driver. It will likely be 
 * replaced with the "Parts" page that was created for changing 
 * the control paradigm to resemble the standalone behavior of 
 * the SL controls. 
 * 
 * @author Dave Burris (04/19/2022) 
 *  
 * @return  Constructed selected track page. 
 */
function makePageSelectedTrack() {
    var page = makePageWithDefaults('Selected Track')

    var selectedTrackChannel = page.mHostAccess.mTrackSelection.mMixerChannel

    for(var idx = 0; idx < surfaceElements.knobStrips.length; ++idx)
        page.makeValueBinding (surfaceElements.knobStrips[idx].knob.mSurfaceValue, selectedTrackChannel.mQuickControls.getByIndex(idx))
    
    return page
}


/**
 * Construct subpage within the specified subpage area.
 * 
 * @author Dave Burris (04/19/2022)
 * 
 * @param subPageArea   Area to contain subpages.
 * @param name          Subpage name. 
 *  
 * @return  Constructed subpage. 
 */
function makeSubPage(subPageArea, name) {
    var subPage = subPageArea.makeSubPage(name)

    subPage.mOnActivate = function(activeDevice) {
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
 * @author Dave Burris (04/19/2022) 
 *  
 * @return  Constructed mixer page. 
 */
function makePageMixer() {
    var page = makePageWithDefaults('Mixer')
    var numParts = 8;

    // Create subpage area to contain the subpages.
    var knobSubPageArea = page.makeSubPageArea('Knobs')

    // Create the pan subpage.
    var subPagePan = makeSubPage(knobSubPageArea, 'Pan')

    // Create the send subpages.
    var subPageListSendLevel = []

    // Create subpages for the Sends.
    var numSendLevelSubPages = midiremote_api.mDefaults.getNumberOfSendSlots ()
    for(var subPageIdx = 0; subPageIdx < numSendLevelSubPages; ++subPageIdx) {
        var nameSubPage = 'Send ' + (subPageIdx + 1).toString()
        var subPageSendLevel = makeSubPage(knobSubPageArea, nameSubPage)
        subPageListSendLevel.push(subPageSendLevel)
    }

    var hostMixerBankZone = page.mHostAccess.mMixConsole.makeMixerBankZone()
        .excludeInputChannels()
        .excludeOutputChannels()

    /**
     * Bind the "channel" controls.
     */
    function bindChannelBankItem(index) {
        var channelBankItem = hostMixerBankZone.makeMixerBankChannel()

        // Variables for the simplifcation of the binding code.
        var knobValue = surfaceElements.knobStrips[index].knob.mSurfaceValue
        var muteValue = surfaceElements.faderStrips[index].btnMute.mSurfaceValue
        var soloValue = surfaceElements.faderStrips[index].btnSolo.mSurfaceValue
        var faderValue = surfaceElements.faderStrips[index].fader.mSurfaceValue

        // Bind the pan knob on the pan subpage.
        page.makeValueBinding(knobValue, channelBankItem.mValue.mPan).setSubPage(subPagePan)
        // Bind the mute and solo buttons and set to toggle mode.
        page.makeValueBinding(muteValue, channelBankItem.mValue.mMute).setTypeToggle()
        page.makeValueBinding(soloValue, channelBankItem.mValue.mSolo).setTypeToggle()

        // Bind volume to fader. Set the fader mode here.
        page.makeValueBinding(faderValue, channelBankItem.mValue.mVolume).setValueTakeOverModePickup( )

        // Bind the sends to the appropriate send subpage(s).
        for(var subPageIdx = 0; subPageIdx < numSendLevelSubPages; ++subPageIdx) {
            var sendLevel = channelBankItem.mSends.getByIndex(subPageIdx).mLevel
            var subPage = subPageListSendLevel[subPageIdx]

            page.makeValueBinding (knobValue, sendLevel).setSubPage(subPage)
        }

    }

    for(var i = 0; i < numParts; ++i)
        bindChannelBankItem(i)

    // Binding for subpage navigation.
    page.makeActionBinding(surfaceElements.btn_prevKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mPrev)
    page.makeActionBinding(surfaceElements.btn_nextKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mNext)
    //page.makeActionBinding(surfaceElements.btn_prevFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mPrev)
    //page.makeActionBinding(surfaceElements.btn_nextFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mNext)

    return page
}

/**
 * Create a page for the settings in each SL Part. This a a new 
 * page for development of the SL navigation resembling the 
 * standalone operation while in InControl mode. 
 * 
 * @author Dave Burris (04/19/2022) 
 *  
 * @return Created page. 
 */
function makePageParts() {
    // Create "Parts" page with the common controls.
    var page = makePageWithDefaults('Parts')
    var numParts = 8

    // Create the parts subpage area to contain the subpages.
    var knobSubPageArea = page.makeSubPageArea('Knob Area')
    var faderSubpageArea = page.makeSubPageArea( 'Fader Area' )

    // Create the subppages for each of the eight parts.
    for(var subPageIdx = 0; subPageIdx < numParts; ++subPageIdx) {
        var nameSubPage = 'Knob Page ' + (subPageIdx + 1).toString()
        var subPagePart = makeSubPage(knobSubPageArea, nameSubPage)

        nameSubPage = 'Fader Page' + (subPageIdx + 1).toString( )
        subPagePart = makeSubPage( faderSubpageArea, nameSubPage )
    }

    // Make the bindings to traverse SL Parts. Each Part is a subpage.
    page.makeActionBinding(surfaceElements.btn_prevKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mPrev)
    page.makeActionBinding(surfaceElements.btn_nextKnobSubPage.mSurfaceValue, knobSubPageArea.mAction.mNext)
    page.makeActionBinding(surfaceElements.btn_prevFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mPrev)
    page.makeActionBinding(surfaceElements.btn_nextFaderSubPage.mSurfaceValue, faderSubpageArea.mAction.mNext)

    return page
}

// Create the driver pages. Each created page must bind to the navigation!
var pageMixer           = makePageMixer()
var pageSelectedTrack   = makePageSelectedTrack()
var pageParts           = makePageParts()

/**
 * Activation callback for the mixer page.
 */
pageMixer.mOnActivate = function (context) {
    var fromPage = context.getState( 'Current Page' )
    var newPage = 'Mixer'
    context.setState( 'Current Page', newPage )
	helper.display.reset(context, midiOutput)
}

/**
 * Activation callback for selected track page.
 */
pageSelectedTrack.mOnActivate = function (context) {
    var fromPage = context.getState( 'Current Page' )
    var newPage = 'Selected Track'
    context.setState( 'Current Page ', newPage )
	helper.display.reset(context, midiOutput)
}

/**
 * Activation callback for the Parts page.
 */
pageParts.mOnActivate = function( context ) {
    var fromPage = context.getState( 'Current Page' )
    var newPage = 'Parts'
    context.setState( 'Current Page', newPage )
    helper.display.reset(context, midiOutput)
}
