import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesComponent } from './courses.component';
import { Component } from '@angular/core';
import { FuseTranslationLoaderService } from '../../../core/services/translation-loader.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestoreModule } from 'angularfire2/firestore';
import { FuseSplashScreenService } from '../../../core/services/splash-screen.service';
import { FuseConfigService } from '../../../core/services/config.service';
import { FuseNavigationService } from '../../../core/components/navigation/navigation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { fuseAnimations } from '../../../core/animations';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FirebaseDatabase } from '@firebase/database-types';
import { FuseIfOnDomDirective } from '../../../core/directives/fuse-if-on-dom/fuse-if-on-dom.directive';
import { FirebaseApp, FirebaseAppProvider } from 'angularfire2';
import { FirebaseFirestore, DocumentReference } from '@firebase/firestore-types';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../../auth/auth.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { CourseComponent } from './course/course.component';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';
import { GamesViewComponent } from '../games/games-view.component';
import { RateModule } from '../rate/rate.module';
import { RateCourseComponent } from '../rate/rate-course/rate-course.component';


import { AuthGuard, StudentGuard, ProfessorGuard, CanUpdateCourseGuard } from '../../../../app/auth/auth_guard/auth.guard';
import { ViewerCoursesComponent } from './viewer-courses/viewer-courses.component';
import { CreatorCoursesComponent } from './creator-courses/creator-courses.component';
import { CourseTopScoresComponent } from './course-top-scores/course-top-scores.component';
import { TranslateModule,TranslateService } from '@ngx-translate/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
  import { RouterTestingModule } from '@angular/router/testing';

import { AngularFireDatabaseModule } from 'angularfire2/database';
const environment = {
  production: false,
  hmr: false,
  firebase: {
    apiKey: "AIzaSyDRejLleE6Z1B8y9vt-RKJpC3MpOXp7n6M",
    authDomain: "sofia-97b65.firebaseapp.com",
    databaseURL: "https://sofia-97b65.firebaseio.com",
    projectId: "sofia-97b65",
    storageBucket: "sofia-97b65.appspot.com",
    messagingSenderId: "749913572579"
  }
}

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CoursesComponent], // declare the test component
      imports: [
        CommonModule,
        SharedModule,
        FuseWidgetModule,
        RateModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireStorageModule,
        AngularFireAuthModule,
    ],

    providers : [AuthGuard, StudentGuard, ProfessorGuard, CanUpdateCourseGuard, TranslateService, 
                 AngularFireDatabase,
                  AngularFireDatabaseModule,
                  AngularFirestore, AuthService, FuseSplashScreenService,
                  FuseConfigService,
                  FuseNavigationService,FuseTranslationLoaderService]
  })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it ('should compare search bar input with given query',() => {
    component.searchBarInput = "Curso de Inglés"
    expect(component.testInput("cUrSo dE InGLés")).toBe(true)
  });
  
});
