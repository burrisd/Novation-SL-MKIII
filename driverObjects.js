/**
 * @file    driverObjects.js
 *
 * This file is under development. The intent is to provide a
 * better separation of driver core from user configuration. The
 * end goal is to provide a simpler and potentially data-driven
 * design, largely free of the details of the MIDI Remote API.
 *
 * This should be considered advanced development and will
 * change significantly over a relatively short time span.
 *
 * NOTE: IT IS IMPORTANT NOT TO CONFUSE THE MIDI REMOTE API
 * DATA WITH THE THIS FRAMEWORK!
 */

/**
 * Data hidden from the application but not required as object
 * private are declared here. These will not be directly
 * accessable in application code. If there are legit reasons
 * for access, provide accessor functions.
 */
var midiremote_api;
var deviceDriverApi;
var midiInput;
var midiOutput;


function driverSubPage(  )
{
    this.data;
}

function driverSubPageArea(  )
{
    this.data;
    this.subPage = [  ];
}

function driverPage(  )
{
    this.data;
    this.subPageArea = [  ];
}

var driverData = [  ];

var currentPage = 0;
var currentSubPage = 0;
var currentSubPageArea = 0;

function    Driver( vendor, model, author )
{
    midiremote_api  = require( 'midiremote_api_v1' );
    this.api = midiremote_api.makeDeviceDriver( vendor, model, author );
    // Get the MIDI Remote API interfaces. (Required!)
    deviceDriverApi = this.api;

    midiInput = deviceDriverApi.mPorts.makeMidiInput(  );
    midiOutput = deviceDriverApi.mPorts.makeMidiOutput(  );

    const DEBUG_MODE    = 0;

    // @ts-ignore
    if( DEBUG_MODE == 1 )
    {
        /**
         * For debugging MIDI traffic. These MIDI ports are created with
         * loopMIDI and configured with MIDI-OX such that the MIDI
         * traffic in both directions can be recorded. This is very
         * helpful is you want to observe MIDI traffic generated by
         * your callbacks.
         */
        deviceDriverApi.makeDetectionUnit( ).detectPortPair( midiInput, midiOutput )
            .expectInputNameEquals( 'To-Cubase' )
            .expectOutputNameEquals( 'From-Cubase' )
            .expectSysexIdentityResponse( '002029', '0101', '0000' )
    }
    else
    {
        /**
         * For standard operation of InControl mode on the SL. These are
         * the ports you would connect to in MIDI-OX for the debug
         * sample above.
         */
        deviceDriverApi.makeDetectionUnit( ).detectPortPair( midiInput, midiOutput )
            .expectInputNameEquals( 'MIDIIN2 (Novation SL MkIII)' )
            .expectOutputNameEquals( 'MIDIOUT2 (Novation SL MkIII)' )
            .expectSysexIdentityResponse( '002029', '0101', '0000' )
    }
}


/**
 * Create a driver page instance. Currently the page
 * is built with a fixed number of subpage areas and subpages.
 *
 * @todo Configurable number of subpage areas and subpages.
 *
 * @param deviceDriver MIDI Remote API driver instance.
 * @param pageName          Text page name.
 */
function DriverPage( deviceDriver, pageName )
{
    this.name           = pageName;
    this.api            = deviceDriverApi.mMapping.makePage( this.name );

    var pageData = new driverPage( );
    pageData.data = this;

    driverData.push( pageData );
    currentPage = driverData.length - 1;

    /**
     * @todo This should be elsewhere!
     */
    this.api.setLabelFieldText( ui.deviceLabel.api, '61SL MK3' );

    this.hostTransportInfo = function( )
    {
        return this.api.mHostAccess.mTransport.mValue;
    }
    this.bindAction = function( control, action )
    {
       this.api.makeActionBinding( control.api.mSurfaceValue, action );
    }
    this.bindValue = function( control, value )
    {
        this.api.makeValueBinding( control.api.mSurfaceValue, value ).setTypeToggle( );
    }
    this.bindFaderValue = function( control, value )
    {
        this.api.makeValueBinding( control.api.mSurfaceValue, value ).setValueTakeOverModePickup( );
    }
}


/**
 * Create a subpage area.
 *
 * @param driverPage        Parent page.
 * @param subPageAreaName   Name of the subpage area.
 */
function SubPageArea( driverPage, subPageAreaName )
{
    this.name           = subPageAreaName;
    this.api            = driverPage.api.makeSubPageArea( this.name );

    var subPageAreaData = new driverSubPageArea(  );
    subPageAreaData.data = this;

    driverData[ currentPage ].subPageArea.push( subPageAreaData )
    currentSubPageArea = driverData[ currentPage ].subPageArea.length - 1;
}

/**
 * Create the subpages for a subpage area.
 *
 * @param subPageArea   Subpage area object.
 * @param subPageName   Subpage name.
 */
function SubPage( subPageArea, subPageName )
{
    this.name = subPageName;
    this.api = subPageArea.api.makeSubPage( this.name );

    var subPageData = new driverSubPage(  );
    subPageData.data = this;

    driverData[ currentPage ].subPageArea[ currentSubPageArea ].subPage.push( subPageData );
    currentSubPage = driverData[ currentPage ].subPageArea[ currentSubPageArea ].subPage.length - 1;

    this.api.mOnActivate = function( context )
    {
        console.log( 'Subpage ' + subPageName );
    }
}


/**
 * Construct a virtual button for the control surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function Button( x, y, w, h )
{
    this.api = deviceDriverApi.mSurface.makeButton( x, y, w, h );

    this.bindCC = function( channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
    }
    this.setShapeCircle = function( )
    {
        this.api.setShapeCircle( );
    }
    this.setTypePush = function(  )
    {
        this.api.setTypePush( );
    }
    this.setTypeToggle = function( )
    {
        this.api.setTypeToggle( );
    }
}

/**
 * Construct a virtual knob for the surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function Knob( x, y, w, h )
{
    this.api = deviceDriverApi.mSurface.makeKnob( x, y, w, h )

    this.bindCC = function( channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc ).setTypeRelativeTwosComplement( );
    }
}


/**
 * Construct a virtual fader for the surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function Fader( x, y, w, h )
{
    this.api = deviceDriverApi.mSurface.makeFader( x, y, w, h )

    this.bindCC = function( channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
    }
    this.setTypeVertical = function( )
    {
        this.api.setTypeVertical( );
    }
    this.setTypeHorizontal = function( )
    {
        this.api.setTypeHorizontal( );
    }
}


/**
 * Construct a virtual label for the surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function Label( x, y, w, h, text )
{
    this.api = deviceDriverApi.mSurface.makeLabelField( x, y, w, h );
}


/**
 * Construct a virtual trigger pad for the surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function TriggerPad(  x, y, w, h ) {
    this.api = deviceDriverApi.mSurface.makeTriggerPad( x, y, w, h )

    this.bindNote = function( channel, note )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToNote( channel, note );
    }
}


/**
 * Construct a virtual piano keyboard (visual only) for the
 * surface.
 *
 * @param deviceDriver  Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 * @param first First key on the kayboard.
 * @param last  Last key on the keyboard.
 */
function PianoKeys( x, y, w, h, first, last )
{
    this.api = deviceDriverApi.mSurface.makePianoKeys( x, y, w, h, first, last )
}


/**
 * Construct a virtual blind panel (visual only) for the
 * surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function BlindPanel( x, y, w, h )
{
    this.api = deviceDriverApi.mSurface.makeBlindPanel( x, y, w, h )
}


/**
 * Construct a virtual pitch wheel for the
 * surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function PitchWheel( x, y, w, h )

{
    this.api = deviceDriverApi.mSurface.makePitchBend( x, y, w, h )

    this.bindPitch = function( midiInput, channel )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToPitchBend( channel );
    }
}


/**
 * Construct a virtual modulation wheel for the
 * surface.
 *
 * @param deviceDriver Driver object.
 * @param x     Object location x.
 * @param y     Object location y.
 * @param w     Object width.
 * @param h     Object height.
 */
function ModWheel( x, y, w, h )
{
    this.api = deviceDriverApi.mSurface.makeModWheel( x, y, w, h )

    this.bindCC = function( channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
    }
}


/**
 * Provide access to the structure holding the mapping page,
 * subpage area, and subpage heirarchy. It is currently being
 * used to traverse and make the bindings for items shared on
 * multiple page/subpage.
 *
 * @todo Ultimately it would be nice not to expose this! For
 *       development purposes it will stay for now.
 */
function DriverData(  )
{
    return driverData;
}


/**
 * LCD accessor functions to simplify use of the helper
 * functions.
 */
function lcdActions( )
{
    var msg;

    /**
     * Set displays to a default condition.
     */
    this.resetDisplays = function( context )
    {
        helper.display.reset( context,  midiOutput );
    }
    /**
     * Post a notification for the center LCD.
     */
    this.notification = function( context, line1, line2 )
    {
        msg = helper.sysex.setNotificationText( line1, line2 );
        midiOutput.sendMidi( context, msg );
    }
    /**
     * Update an LCD text item.
     */
    this.displayText = function( context, displayCol, displayRow, text )
    {
        msg = helper.sysex.displaySetTextOfColumn( displayCol, displayRow, text );
        midiOutput.sendMidi( context, msg );
    }
    /**
     * Update display item color using RGB.
     */
    this.displayColorRGB = function( context, displayCol, displayRow, red, green, blue )
    {
        msg = helper.sysex.setDisplayColorOfColumn( displayCol, displayRow, red, green, blue );
        midiOutput.sendMidi( context, msg );
    }
    /**
     * Update display item value text.
     */
    this.displayValue = function( context, displayCol, displayRow, value )
    {
        msg = helper.sysex.setDisplayValueOfColumn( displayCol, displayRow, value );
        midiOutput.sendMidi( context, msg );
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



module.exports =
{
    makeDriver:         Driver,
    makePage:           DriverPage,
    makeSubPageArea:    SubPageArea,
    makeSubPage:        SubPage,

    makeModWheel:       ModWheel,
    makePitchWheel:     PitchWheel,
    makeBlindPanel:     BlindPanel,
    makePianoKeys:      PianoKeys,
    makeTriggerPad:     TriggerPad,
    makeLabel:          Label,
    makeFader:          Fader,
    makeKnob:           Knob,
    makeButton:         Button,
    getdriverData:      DriverData,
    lcdApi:             lcdActions,
    ledApi:             ledActions,
}
