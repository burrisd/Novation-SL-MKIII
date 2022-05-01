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
 */


function DriverPage( deviceDriver, pageName )
{
    pageApi             = deviceDriver.mMapping.makePage( pageName );
    this.name           = pageName;
    this.subpageArea    = [ ];

    console.log( 'Created ' + this.name );

    function SubPageArea( subpageAreaName )
    {
        subPageAreaApi      = pageApi.makeSubPageArea( subpageAreaName );
        this.name           = subpageAreaName;
        this.subPage        = [ ];

        console.log( 'Created ' + subpageAreaName );

        function Subpage( subPageName )
        {
            subPageApi      = subPageAreaApi.makeSubPage( subPageName );
            this.name       = subPageName;

            console.log( 'Created ' + subPageName );
        }

        for( var i = 0; i < 8; ++i )
        {
            this.subPage[ i ] = new Subpage( 'Subpage ' + i.toString(  ) )
        }

    }

    for( var i = 0; i < 3; ++i )
    {
        this.subpageArea[ i ] = new SubPageArea( 'SubPageArea ' + i.toString( ) );
    }
}

module.exports =
{
    page:
    {
        makePage:   DriverPage
    }
}
