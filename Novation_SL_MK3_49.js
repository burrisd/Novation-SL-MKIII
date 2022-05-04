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

/*
 *  NOTE:   When controlling LEDs, it is important to understand
 *          which of the value below to use. For single-byte color
 *          index, use the InControl CC values in the first section.
 *          To set color using RGB values, a SYSEX message is required
 *          and the ID from the SYSEX group must be used.
 */


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

/** The helper functions construct the MIDI messages required
 *  to update the displays and LEDs based on values passed in to
 *  the functions.
 */
var helper   = require( './helper' );
var define   = require( './constants' )  // Constants defining surface controls.
var mydriver = require( './driverObjects.js' )


// Create the device driver object.
var slDriver        = new mydriver.makeDriver( 'Novation', 'SL MK3 49', 'David Burris - Burris Audio' )

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
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Update an LCD text item.
     */
    this.displayText = function( context, displayCol, displayRow, text )
    {
        msg = helper.sysex.displaySetTextOfColumn( displayCol, displayRow, text )
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Update display item color using RGB.
     */
    this.displayColorRGB = function( context, displayCol, displayRow, red, green, blue )
    {
        msg = helper.sysex.setDisplayColorOfColumn( displayCol, displayRow, red, green, blue )
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Update display item value text.
     */
    this.displayValue = function( context, displayCol, displayRow, value )
    {
        msg = helper.sysex.setDisplayValueOfColumn( displayCol, displayRow, value )
        slDriver.midiOutput.sendMidi( context, msg )
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
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Set LED color by RGB.
     */
    this.colorRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDColorRGB( ledId, red, green, blue )
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Flash LED between this and previous color Ids.
     */
    this.flashRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDFlashRGB( ledId, red, green, blue )
        slDriver.midiOutput.sendMidi( context, msg )
    }
    /**
     * Flash LED between two color Ids.
     */
    this.pulseRGB = function( context, ledId, red, green, blue )
    {
        msg = helper.sysex.setLEDPulseRGB( ledId, red, green, blue )
        slDriver.midiOutput.sendMidi( context, msg )
    }
}


var lcdApi = new lcdActions
var ledApi = new ledActions


/**
 * Construct the Transport buttons.
 *
 * @param x     Horizontal location.
 * @param y     Verticle location.
 *
 * @return      Constructed tranport assembly.
 */
function makeTransport( x, y ) {
    var transport = { }

    var w         = 2
    var h         = 2

    var currX     = x

    // Create the buttons.

    transport.btnRewind = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;
    transport.btnForward = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;
    transport.btnStop = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;
    transport.btnStart = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;
    transport.btnCycle = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;
    transport.btnRecord = new mydriver.makeButton( slDriver, currX, y, w, h );
    currX += w;

    return transport
}


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
function makeFaderStrip( faderIndex, x, y ) {
    var faderStrip = { }

    /**
     * Create the surface controls.
     */
    faderStrip.btnTop = new mydriver.makeButton( slDriver, x + 2 * faderIndex, y, 2, 1 )
    faderStrip.btnBottom = new mydriver.makeButton( slDriver, x + 2 * faderIndex, y + 1, 2, 1 )

    faderStrip.fader = new mydriver.makeFader( slDriver, x + 2 * faderIndex, y + 3, 2, 6 )
    faderStrip.fader.setTypeVertical( )

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
function makeKnobStrip( knobIndex, x, y ) {
    var knobStrip = { }

    /**
     * Create the controls.
     */
    knobStrip.knob      = new mydriver.makeKnob( slDriver, x + 2 * knobIndex, y, 2, 2 )
    knobStrip.button    = new mydriver.makeButton( slDriver, x + 2 * knobIndex, y + 4, 2, 1 )
    knobStrip.pad1      = new mydriver.makeTriggerPad( slDriver, x + 2 * knobIndex, y + 5, 2, 2 )
    knobStrip.pad2      = new mydriver.makeTriggerPad( slDriver, x + 2 * knobIndex, y + 7, 2, 2 )

    return knobStrip
}


/**
 * Construct the control surface elements.
 *
 * @return  Constructed control surface assembly.
 */
function makeSurfaceElements( )
{
    var ui = { };

    ui.knobGroup = { };
    ui.faderGroup = { };

    ui.numStrips = 8;

    ui.btn_prevDriverPage = new mydriver.makeButton( slDriver, 4, 5, 2, 2 );
    ui.btn_nextDriverPage = new mydriver.makeButton( slDriver, 4, 7, 2, 2 );

    ui.btn_nextDriverPage.setShapeCircle( );
    ui.btn_prevDriverPage.setShapeCircle( );

    ui.btn_options      = new mydriver.makeButton( slDriver, 22, 4, 2, 1 );
    ui.btn_grid         = new mydriver.makeButton( slDriver, 4, 4, 2, 1 );
    ui.btn_clear        = new mydriver.makeButton( slDriver, 0, 6, 2, 1 );
    ui.btn_duplicate    = new mydriver.makeButton( slDriver, 0, 5, 2, 1  );
    ui.btn_padLeft      = new mydriver.makeButton( slDriver, 22, 5, 2, 2 );
    ui.btn_padRight     = new mydriver.makeButton( slDriver, 22, 7, 2, 2 );

    ui.btn_padLeft.setShapeCircle( );
    ui.btn_padRight.setShapeCircle( );

    // Create left.right arrow buttons.
    ui.btn_prevTrack = new mydriver.makeButton( slDriver, 0, 7, 2, 1 );
    ui.btn_nextTrack = new mydriver.makeButton( slDriver, 2, 7, 2, 1 );

    ui.btn_prevKnobSubPage = new mydriver.makeButton( slDriver, 4, 2, 2, 1 );
    ui.btn_nextKnobSubPage = new mydriver.makeButton( slDriver, 4, 3, 2, 1 );

    ui.btn_prevFaderSubPage = new mydriver.makeButton( slDriver, 40, 0, 2, 1 );
    ui.btn_nextFaderSubPage = new mydriver.makeButton( slDriver, 40, 1, 2, 1 );

    ui.deviceLabel = new mydriver.makeLabel( slDriver, 45, 0, 7, 2 );

    for (var i = 0; i < ui.numStrips; ++i)
    {
        ui.faderGroup[ i ] = makeFaderStrip( i, 24, 0 );
        ui.knobGroup[ i ] = makeKnobStrip( i, 6, 0 );
    }

    ui.pianoKeys    = new mydriver.makePianoKeys( slDriver, 5, 10, 48, 7, 0, NUM_PIANO_KEYS );

    ui.knobgroupBlindPanel  = new mydriver.makeBlindPanel( slDriver, 6, 0 + 2, ui.numStrips * 2, 2 );
    ui.knobgroupBlindPanel2 = new mydriver.makeBlindPanel( slDriver, 6 + 16, 0 + 2, 2, 2 );

    ui.transport    = makeTransport( 41, 7 );

    ui.modWheel     = new mydriver.makeModWheel( slDriver, 3, 11, 1, 6 );
    ui.pitchwheel   = new mydriver.makePitchWheel( slDriver, 1, 11, 1, 6 );

    return ui
}


/**
 * Bind MIDI to surface controls.
 *
 * @param ui    User interface structure, container for surface
 *              controls.
 */
function makeSurfaceMidiBindings( ui )
{
    // Bind the controls to MIDI CC.
    ui.btn_prevDriverPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.PADS_UP_BUTTON );
    ui.btn_nextDriverPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.PADS_DOWN_BUTTON );
    ui.btn_prevKnobSubPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SCREEN_UP_BUTTON );
    ui.btn_nextKnobSubPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SCREEN_DOWN_BUTTON )
    ui.btn_prevFaderSubPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.RIGHT_SOFTBUTTONS_UP );
    ui.btn_nextFaderSubPage.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.RIGHT_SOFTBUTTONS_DOWN );

    ui.btn_options.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.OPTIONS_BUTTON );
    ui.btn_grid.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.GRID_BUTTON );
    ui.btn_clear.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.CLEAR_BUTTON );
    ui.btn_duplicate.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.DUPLICATE_BUTTON );
    ui.btn_padLeft.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SCENE_LAUNCH_TOP );
    ui.btn_padRight.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SCENE_LAUNCH_BOTTOM );
    ui.btn_prevTrack.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.TRACK_LEFT );
    ui.btn_nextTrack.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.TRACK_RIGHT );

    for( var i = 0; i  < ui.numStrips; ++i )
    {
        ui.faderGroup[ i ].btnTop.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SOFTBUTTON_9 + i );
        ui.faderGroup[ i ].btnBottom.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SOFTBUTTON_17 + i );
        ui.faderGroup[ i ].fader.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.FADER_1 + i );
        ui.knobGroup[ i ].knob.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.ROTARY_KNOB_1 + i );
        ui.knobGroup[ i ].button.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.SOFTBUTTON_1 + i )
        ui.knobGroup[ i ].pad1.bindNote( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.PAD_1 + i )
        ui.knobGroup[ i ].pad2.bindNote( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.PAD_9 + i )
    }

    ui.transport.btnRewind.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.REWIND )
    ui.transport.btnForward.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.FAST_FORWARD )
    ui.transport.btnStop.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.STOP_BUTTON )
    ui.transport.btnStart.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.PLAY_BUTTON )
    ui.transport.btnCycle.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.LOOP_BUTTON )
    ui.transport.btnRecord.bindCC( slDriver.midiInput, INCONTROLMIDICHANNEL, define.ccId.id.RECORD_BUTTON )

}


var ui = makeSurfaceElements( );
makeSurfaceMidiBindings( ui );


// Create the driver pages. Each created page must bind to the navigation!
var MixerPage   = new mydriver.makePage( slDriver, 'Mixer Page' );
var testPage    = new mydriver.makePage( slDriver, 'Test Page' );


// Create subpage areas to contain the subpages.
var subPageArea = new mydriver.makeSubPageArea( MixerPage, 'Knobs' );
var subPagePan  = new mydriver.makeSubPage( subPageArea, 'Pan' );
var subPageSend = new mydriver.makeSubPage( subPageArea, 'Send' );


/* Create a binding for the controls that exist on every page/subpage. This traverses the
 * the list of created pages and makes bindings for all pages/subpages.
 */
slDriver.driverPages.forEach( bindPages );
function bindPages( page,  index, array )
{
    var hostMixerBankZone   = page.api.mHostAccess.mMixConsole.makeMixerBankZone( )
        .excludeInputChannels( )
        .excludeOutputChannels( )

    if( page.subPageArea.length == 0 )
    {
        console.log( 'Page binding ' + page.name )
        for( var i = 0; i < ui.numStrips; ++i )
        {
            var channelBankItem = hostMixerBankZone.makeMixerBankChannel(  );
            var selectedButtonValue = ui.knobGroup[ i ].button.api.mSurfaceValue;

            page.api.makeValueBinding( selectedButtonValue, channelBankItem.mValue.mSelected );
        }
    }
    page.bindAction( ui.btn_prevDriverPage, slDriver.api.mAction.mPrevPage );
    page.bindAction( ui.btn_nextDriverPage, slDriver.api.mAction.mNextPage );
    page.bindValue( ui.transport.btnRewind, page.hostTransportInfo( ).mRewind );
    page.bindValue( ui.transport.btnForward, page.hostTransportInfo( ).mForward );
    page.bindValue( ui.transport.btnStop, page.hostTransportInfo( ).mStop );
    page.bindValue( ui.transport.btnStart, page.hostTransportInfo( ).mStart );
    page.bindValue( ui.transport.btnCycle, page.hostTransportInfo( ).mCycleActive );
    page.bindValue( ui.transport.btnRecord, page.hostTransportInfo( ).mRecord );
    /* If the page has subpages, bind the subpage navigation. */
    page.subPageArea.forEach( bindSubpageArea )
    {
        function bindSubpageArea( subPageArea, index, array )
        {
            page.bindAction( ui.btn_prevKnobSubPage, subPageArea.api.mAction.mPrev );
            page.bindAction( ui.btn_nextKnobSubPage, subPageArea.api.mAction.mNext );

            subPageArea.subPages.forEach( bindSubPage )
            {
                function bindSubPage( subPage, index, array )
                {
                    for( var i = 0; i < ui.numStrips; ++i )
                    {
                        var channelBankItem     = hostMixerBankZone.makeMixerBankChannel(  );

                        console.log( 'Subpage binding ' + subPage.name );
                        page.api.makeValueBinding( ui.knobGroup[ i ].button.api.mSurfaceValue, channelBankItem.mValue.mSelected ).setSubPage( subPage.api );
                    }
                }
            }
        }
    }

}

//page.makeValueBinding( knobValue, channelBankItem.mValue.mPan ).setSubPage( subPagePan )
//page.makeValueBinding( muteValue, channelBankItem.mValue.mMute ).setTypeToggle( )
//page.makeValueBinding( soloValue, channelBankItem.mValue.mSolo ).setTypeToggle( )
//page.makeValueBinding( faderValue, channelBankItem.mValue.mVolume ).setValueTakeOverModePickup( )
//page.makeValueBinding( knobValue, sendLevel ).setSubPage( subPage )
//page.makeValueBinding( selectedButtonValue, channelBankItem.mValue.mSelected )
//page.makeValueBinding( surfaceElements.knobStrips[ idx ].knob.mSurfaceValue, selectedTrackChannel.mQuickControls.getByIndex( idx ) )











