import { DynamicModule, Global, Inject, Module, Provider, Type } from '@nestjs/common'
import { FactorydriveService } from './factorydrive.service'
import { FACTORYDRIVE_MODULE_OPTIONS_TOKEN } from './factorydrive.constants'
import { FactorydriveModuleAsyncOptions, FactorydriveModuleOptions, FactorydriveModuleOptionsFactory } from './factorydrive.interfaces'
import { ModuleRef } from '@nestjs/core'

@Global()
@Module({})
export class FactorydriveCoreModule {
  public constructor() {} // private readonly moduleRef: ModuleRef, // private readonly options: FactorydriveModuleOptions, // @Inject(FACTORYDRIVE_MODULE_OPTIONS_TOKEN)

  public static forRoot(options: FactorydriveModuleOptions): DynamicModule {
    const storageModuleOptions: Provider = {
      provide: FACTORYDRIVE_MODULE_OPTIONS_TOKEN,
      useValue: options.config,
    }
    return {
      module: FactorydriveCoreModule,
      providers: [storageModuleOptions, FactorydriveService],
      exports: [FactorydriveService],
    }
  }

  public static forRootAsync(options: FactorydriveModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options)
    return {
      module: FactorydriveCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, FactorydriveService],
      exports: [FactorydriveService],
    }
  }

  private static createAsyncProviders(options: FactorydriveModuleAsyncOptions): Provider[] {
    if (options.useFactory) return [this.createAsyncOptionsProvider(options)]
    const useClass = options.useClass as Type<FactorydriveModuleOptionsFactory>
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: FactorydriveModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: FACTORYDRIVE_MODULE_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }
    const inject = [options.useClass as Type<FactorydriveModuleOptionsFactory>]
    return {
      provide: FACTORYDRIVE_MODULE_OPTIONS_TOKEN,
      useFactory: async (optionsFactory: FactorydriveModuleOptionsFactory) => optionsFactory.createFactorydriveModuleOptions(),
      inject,
    }
  }
}
