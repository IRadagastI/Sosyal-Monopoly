package com.iradagasti.bilgiopoli;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class MainActivityUnitTest {

    @Test
    public void textZoom_respectsSystemScaleWithinSafeBounds() {
        assertEquals(85, MainActivity.textZoomForFontScale(0.5f));
        assertEquals(100, MainActivity.textZoomForFontScale(1.0f));
        assertEquals(125, MainActivity.textZoomForFontScale(1.25f));
        assertEquals(130, MainActivity.textZoomForFontScale(2.0f));
    }
}
