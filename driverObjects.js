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



function    Driver( vendor, model, author )
{
    // Get the MIDI Remote API interfaces. (Required!)
    var midiremote_api  = require( 'midiremote_api_v1' )
    this.api            = midiremote_api.makeDeviceDriver( vendor, model, author );

    this.midiInput = this.api.mPorts.makeMidiInput(  );
    this.midiOutput = this.api.mPorts.makeMidiOutput(  );
    this.driverPages = [  ];

    const DEBUG_MODE    = 0

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
        this.api.makeDetectionUnit( ).detectPortPair( this.midiInput, this.midiOutput )
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
        this.api.makeDetectionUnit( ).detectPortPair( this.midiInput, this.midiOutput )
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
    this.api            = deviceDriver.api.mMapping.makePage( this.name );
    this.subPageArea    = [  ];

    deviceDriver.driverPages.push( this );

    this.bindAction = function( control, action )
    {
       this.api.makeActionBinding( control.api.mSurfaceValue, action );
    }
    this.api.mOnActivate = function( context )
    {
        context.setState( 'Current Page', pageName )
        console.log( 'Page ' + pageName )
    }
}


/**
 * Create a subpage area.
 *
 * @param driverPage        Parent page.
 * @param subPageAreaName   Name of the subpage area.
 * @param numSubPages       Number of subpages to create for
 *                          this area.
 */
function SubPageArea( driverPage, subPageAreaName )
{
    this.name           = subPageAreaName;
    this.api            = driverPage.api.makeSubPageArea( this.name );
    this.subPages       = [  ];

    driverPage.subPageArea.push( this );
}

/**
 * Create the subpages for a subpage area.
 *
 * @param subPageArea
 * @param subPageName
 */
function SubPage( subPageArea, subPageName )
{
    this.name = subPageName;
    this.api = subPageArea.api.makeSubPage( this.name );
    subPageArea.subPages.push( this );

    this.api.mOnActivate = function( context )
    {
        var currentPage = context.getState( 'Current Page' );
        context.setState( 'Current SubPage', subPageName );
        console.log( 'Subpage ' + subPageName );
    }
}


/**
 * Construct a virtual button for the control surface.
 *
 * @param deviceDriver Driver object.
 * @param x
 * @param y
 * @param w
 * @param h
 */
function Button( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeButton( x, y, w, h );

    //knobs.push( this );

    this.bindCC = function( midiInput, channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
    }
    this.setShapeCircle = function( )
    {
        this.api.setShapeCircle( );
    }
}

/**
 * Construct a virtual knob for the surface.
 *
 * @param deviceDriver Driver object.
 * @param x
 * @param y
 * @param w
 * @param h
 */
function Knob( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeKnob( x, y, w, h )

    this.bindCC = function( midiInput, channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc ).setTypeRelativeTwosComplement( );
    }
}


/**
 * Construct a virtual fader for the surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function Fader( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeFader( x, y, w, h )

    this.bindCC = function( midiInput, channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
    }
    this.setTypeVertical = function( )
    {
        this.api.setTypeVertical( );
    }
}


/**
 * Construct a virtual label for the surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function Label( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeLabelField( x, y, w, h )

}


/**
 * Construct a virtual trigger pad for the surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function TriggerPad( deviceDriver, x, y, w, h ) {
    this.api = deviceDriver.api.mSurface.makeTriggerPad( x, y, w, h )

    this.bindNote = function( midiInput, channel, note )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToNote( channel, note );
    }
}


/**
 * Construct a virtual piano keyboard (visual only) for the
 * surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function PianoKeys( deviceDriver, x, y, w, h, first, last )
{
    this.api = deviceDriver.api.mSurface.makePianoKeys( x, y, w, h, first, last )
}


/**
 * Construct a virtual blind panel (visual only) for the
 * surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function BlindPanel( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeBlindPanel( x, y, w, h )
}


/**
 * Construct a virtual pitch wheel for the
 * surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function PitchWheel( deviceDriver, x, y, w, h )

{
    this.api = deviceDriver.api.mSurface.makePitchBend( x, y, w, h )

    this.bindPitch = function( channel )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToPitchBend( channel );
    }
}


/**
 * Construct a virtual modulation wheel for the
 * surface.
 *
 * @param deviceDriver
 * @param x
 * @param y
 * @param w
 * @param h
 */
function ModWheel( deviceDriver, x, y, w, h )
{
    this.api = deviceDriver.api.mSurface.makeModWheel( x, y, w, h )

    this.bindCC = function( channel, cc )
    {
        this.api.mSurfaceValue.mMidiBinding.setInputPort( midiInput ).bindToControlChange( channel, cc );
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
}
